"""Azure Blob Storage service for call recordings"""
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, Optional
from urllib.parse import urlparse

from azure.storage.blob import (
    BlobSasPermissions,
    BlobServiceClient,
    ContentSettings,
    generate_blob_sas,
)

from app.config import settings

logger = logging.getLogger(__name__)


class BlobService:
    """Azure Blob Storage service for managing call recordings"""
    
    def __init__(self):
        self.connection_string = settings.azure_storage_connection_string
        self.container_name = settings.azure_storage_container_name
        self.client: Optional[BlobServiceClient] = None

        if self.connection_string:
            try:
                self.client = BlobServiceClient.from_connection_string(self.connection_string)
                logger.info("blob_service_initialized")
            except Exception as e:
                logger.error(f"blob_service_init_failed: {str(e)}")

    async def upload_file(
        self,
        file_data: bytes,
        file_name: str,
        content_type: str = "audio/mpeg",
        metadata: Optional[Dict[str, str]] = None,
        max_retries: int = 3,
    ) -> Optional[str]:
        """
        Upload file to Azure Blob Storage
        
        Args:
            file_data: File bytes to upload
            file_name: Name of the file (blob name)
            content_type: MIME type
            metadata: Optional metadata dict
            max_retries: Number of retry attempts
            
        Returns:
            Blob URL if successful, None otherwise
        """
        if not self.client:
            logger.warning("blob_service_not_configured")
            return None

        if not file_data:
            logger.warning(f"blob_upload_empty_payload file_name={file_name}")
            return None

        # Get or create container
        container_client = self.client.get_container_client(self.container_name)
        try:
            if not container_client.exists():
                container_client.create_container()
                logger.info(f"blob_container_created name={self.container_name}")
        except Exception as e:
            logger.error(f"blob_container_init_failed: {str(e)}")
            return None

        blob_client = container_client.get_blob_client(file_name)

        # Upload with retries
        attempt = 0
        while attempt < max_retries:
            attempt += 1
            try:
                blob_client.upload_blob(
                    file_data,
                    overwrite=True,
                    content_settings=ContentSettings(content_type=content_type),
                )
                
                # Set metadata if provided
                if metadata:
                    try:
                        blob_client.set_blob_metadata(metadata)
                    except Exception as e:
                        logger.warning(f"blob_set_metadata_failed: {str(e)}")

                # Verify upload
                try:
                    props = blob_client.get_blob_properties()
                    size_ok = props.size == len(file_data)
                except Exception as e:
                    logger.warning(f"blob_properties_check_failed: {str(e)}")
                    size_ok = True

                if not size_ok:
                    logger.error(f"blob_size_mismatch expected={len(file_data)} actual={props.size}")
                    return None

                logger.info(f"blob_upload_success file_name={file_name} size={len(file_data)}")
                return blob_client.url

            except Exception as e:
                logger.error(f"blob_upload_failed attempt={attempt} error={str(e)}")
                if attempt >= max_retries:
                    return None
                await asyncio.sleep(0.5 * (2 ** (attempt - 1)))

        return None

    def _parse_account_credentials(self) -> Optional[Dict[str, str]]:
        """Parse account name and key from connection string"""
        if not self.connection_string:
            logger.warning("blob_sas_missing_connection_string")
            return None
        
        parts: Dict[str, str] = {}
        for segment in self.connection_string.split(";"):
            if "=" in segment:
                key, value = segment.split("=", 1)
                parts[key] = value
        
        account_name = parts.get("AccountName")
        account_key = parts.get("AccountKey")
        
        if not account_name or not account_key:
            logger.error("blob_sas_missing_account_credentials")
            return None
        
        return {"account_name": account_name, "account_key": account_key}

    def generate_sas_for_blob(
        self,
        container_name: str,
        blob_name: str,
        expiry_minutes: int = 15,
    ) -> Optional[str]:
        """
        Generate SAS URL for a blob
        
        Args:
            container_name: Container name
            blob_name: Blob name
            expiry_minutes: SAS token expiry in minutes
            
        Returns:
            SAS URL if successful, None otherwise
        """
        if not self.client:
            logger.warning("blob_sas_client_not_configured")
            return None

        creds = self._parse_account_credentials()
        if not creds:
            return None

        try:
            sas_token = generate_blob_sas(
                account_name=creds["account_name"],
                container_name=container_name,
                blob_name=blob_name,
                account_key=creds["account_key"],
                permission=BlobSasPermissions(read=True),
                expiry=datetime.utcnow() + timedelta(minutes=expiry_minutes),
            )
            
            blob_client = self.client.get_blob_client(
                container=container_name,
                blob=blob_name
            )
            return f"{blob_client.url}?{sas_token}"
            
        except Exception as e:
            logger.error(f"blob_sas_generation_failed: {str(e)}")
            return None

    async def check_blob_exists(self, blob_url: str) -> Optional[str]:
        """
        Check if a blob URL exists and return the clean URL if it does
        
        Args:
            blob_url: Blob URL to check
            
        Returns:
            Clean blob URL if exists, None otherwise
        """
        if not blob_url:
            return None
            
        cleaned = str(blob_url).strip().strip("`").replace("`", "")
        parsed = urlparse(cleaned)
        path = parsed.path.lstrip("/")
        
        if not path or "/" not in path:
            return None
            
        container_name, blob_name = path.split("/", 1)
        
        if not self.client:
            return None

        def _check():
            try:
                blob_client = self.client.get_blob_client(
                    container=container_name,
                    blob=blob_name
                )
                if blob_client.exists():
                    return cleaned
            except Exception as e:
                logger.error(f"blob_exists_check_failed: {str(e)}")
            return None

        return await asyncio.to_thread(_check)

    def generate_sas_from_blob_url(
        self,
        blob_url: str,
        expiry_minutes: int = 15
    ) -> Optional[str]:
        """
        Generate SAS URL from existing blob URL
        
        Args:
            blob_url: Existing blob URL
            expiry_minutes: SAS token expiry in minutes
            
        Returns:
            SAS URL if successful, None otherwise
        """
        if not blob_url:
            return None
        
        cleaned = str(blob_url).strip().strip("`").replace("`", "")
        parsed = urlparse(cleaned)
        path = parsed.path.lstrip("/")
        
        if not path or "/" not in path:
            logger.error(f"blob_sas_invalid_blob_url: {blob_url}")
            return None

        container_name, blob_name = path.split("/", 1)
        
        # Use default container if different
        if container_name == self.container_name:
            return self.generate_sas_for_blob(
                container_name,
                blob_name,
                expiry_minutes=expiry_minutes
            )
        
        # Try with default container for relative paths
        if self.container_name:
            return self.generate_sas_for_blob(
                self.container_name,
                blob_name,
                expiry_minutes=expiry_minutes
            )
        
        return self.generate_sas_for_blob(
            container_name,
            blob_name,
            expiry_minutes=expiry_minutes
        )
    
    def find_latest_blob_name(
        self,
        prefixes: list[str],
        contains: str,
        container_name: Optional[str] = None,
    ) -> Optional[str]:
        """
        Find latest blob matching criteria
        
        Args:
            prefixes: List of path prefixes to search
            contains: String that blob name must contain
            container_name: Optional container name (uses default if not provided)
            
        Returns:
            Blob name if found, None otherwise
        """
        if not self.client:
            logger.warning("blob_service_not_configured")
            return None
            
        target_container = (container_name or self.container_name or "").strip()
        if not target_container:
            logger.warning("blob_container_name_missing")
            return None
            
        if not contains:
            return None

        container_client = self.client.get_container_client(target_container)
        try:
            if not container_client.exists():
                return None
        except Exception:
            return None

        best_name: Optional[str] = None
        best_modified = None
        
        for prefix in prefixes:
            if not prefix:
                continue
            try:
                for blob in container_client.list_blobs(name_starts_with=prefix):
                    name = getattr(blob, "name", None)
                    if not isinstance(name, str) or not name:
                        continue
                    if contains not in name:
                        continue
                    if not name.lower().endswith((".mp3", ".wav")):
                        continue
                        
                    modified = getattr(blob, "last_modified", None)
                    if best_name is None:
                        best_name = name
                        best_modified = modified
                        continue
                    if modified is not None and (best_modified is None or modified > best_modified):
                        best_name = name
                        best_modified = modified
            except Exception as e:
                logger.error(f"blob_search_failed prefix={prefix}: {str(e)}")
                continue
                
        return best_name


# Singleton instance
blob_service = BlobService()
