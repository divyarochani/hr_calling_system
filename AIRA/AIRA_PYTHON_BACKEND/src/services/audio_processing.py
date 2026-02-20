"""
Service for audio recording and processing
"""
import base64
import wave
import audioop
import logging
from pathlib import Path
from typing import List
from datetime import datetime

logger = logging.getLogger(__name__)


def save_recording(
    user_audio_chunks: List[bytes],
    agent_audio_chunks: List[bytes],
    phone_number: str,
    timestamp: datetime,
    recordings_dir: Path
) -> str:
    """
    Save mixed audio recording with both voices properly synchronized
    User audio = Candidate voice (from Twilio)
    Agent audio = AI voice (from ElevenLabs)
    
    Returns: filepath of saved recording
    """
    try:
        filename = f"{phone_number}_{timestamp.strftime('%Y%m%d_%H%M%S')}.wav"
        filepath = recordings_dir / filename
        
        print(f"\n🎙️  Processing audio...")
        print(f"   User chunks: {len(user_audio_chunks)}")
        print(f"   Agent chunks: {len(agent_audio_chunks)}")
        
        # Decode user audio (candidate/caller voice) - from Twilio μ-law
        user_pcm = b''
        for chunk in user_audio_chunks:
            try:
                # Twilio sends μ-law encoded audio
                linear = audioop.ulaw2lin(chunk, 2)
                user_pcm += linear
            except Exception as e:
                logger.debug(f"User audio conversion error: {e}")
                continue
        
        # Decode agent audio (AI voice) - from ElevenLabs μ-law
        agent_pcm = b''
        for chunk in agent_audio_chunks:
            try:
                # ElevenLabs also sends μ-law encoded audio
                linear = audioop.ulaw2lin(chunk, 2)
                agent_pcm += linear
            except Exception as e:
                logger.debug(f"Agent audio conversion error: {e}")
                continue
        
        print(f"   User PCM: {len(user_pcm)} bytes")
        print(f"   Agent PCM: {len(agent_pcm)} bytes")
        
        # If we have both tracks, mix them
        if user_pcm and agent_pcm:
            # Make both tracks the same length by padding with silence
            max_len = max(len(user_pcm), len(agent_pcm))
            
            # Ensure even length (required for 16-bit audio)
            if max_len % 2 != 0:
                max_len += 1
            
            # Pad user audio with silence if needed
            if len(user_pcm) < max_len:
                padding_needed = max_len - len(user_pcm)
                user_pcm += b'\x00' * padding_needed
            else:
                user_pcm = user_pcm[:max_len]
            
            # Pad agent audio with silence if needed
            if len(agent_pcm) < max_len:
                padding_needed = max_len - len(agent_pcm)
                agent_pcm += b'\x00' * padding_needed
            else:
                agent_pcm = agent_pcm[:max_len]
            
            # Mix the two audio streams by adding them together
            try:
                mixed_audio = audioop.add(user_pcm, agent_pcm, 2)
                print(f"   ✅ Mixed audio: {len(mixed_audio)} bytes")
            except Exception as e:
                logger.warning(f"Audio mixing failed, using user audio only: {e}")
                mixed_audio = user_pcm
                print(f"   ⚠️  Using user audio only")
        elif user_pcm:
            # Only user audio available
            mixed_audio = user_pcm
            print(f"   ⚠️  Only user audio available")
        elif agent_pcm:
            # Only agent audio available
            mixed_audio = agent_pcm
            print(f"   ⚠️  Only agent audio available")
        else:
            # No audio at all
            logger.error("No audio data to save!")
            raise ValueError("No audio data available")
        
        # Save as standard PCM WAV file
        with wave.open(str(filepath), 'wb') as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(8000)  # 8000 Hz (Twilio's sample rate)
            wav_file.writeframes(mixed_audio)
        
        logger.info(f"Recording saved: {filepath} ({len(mixed_audio)} bytes)")
        print(f"   💾 Saved: {filename}")
        return str(filepath)
        
    except Exception as e:
        logger.error(f"Failed to save recording: {e}")
        raise
