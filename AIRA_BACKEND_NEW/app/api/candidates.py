"""Candidate management endpoints - MongoDB version"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from beanie import PydanticObjectId
from beanie.operators import Or, And, In

from app.models.candidate import Candidate
from app.models.call import Call
from app.models.user import User
from app.schemas.candidate import (
    CandidateCreate, CandidateUpdate, CandidateInDB,
    CandidateList, CandidateStats, CandidateWithCalls
)
from app.utils.auth import get_current_active_user

router = APIRouter(prefix="/candidates", tags=["Candidates"])


def candidate_to_schema(c: Candidate) -> CandidateInDB:
    """Convert Candidate document to CandidateInDB schema"""
    return CandidateInDB(
        id=str(c.id),
        candidate_name=c.candidate_name,
        phone_number=c.phone_number,
        email=c.email,
        current_company=c.current_company,
        current_role=c.current_role,
        desired_role=c.desired_role,
        experience_years=c.experience_years,
        domain=c.domain,
        current_ctc_lpa=c.current_ctc_lpa,
        expected_ctc_lpa=c.expected_ctc_lpa,
        notice_period=c.notice_period,
        current_location=c.current_location,
        relocation_willing=c.relocation_willing,
        interested=c.interested,
        call_status=c.call_status,
        disconnection_reason=c.disconnection_reason,
        next_round_availability=c.next_round_availability,
        communication_score=c.communication_score,
        technical_score=c.technical_score,
        overall_score=c.overall_score,
        screening_score=c.screening_score,
        status=c.status,
        last_call_id=c.last_call_id,
        notes=c.notes,
        created_at=c.created_at,
        updated_at=c.updated_at
    )


@router.post("/", response_model=CandidateInDB, status_code=status.HTTP_201_CREATED)
async def create_candidate(
    candidate: CandidateCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Create new candidate"""
    # Check if candidate with phone number already exists
    existing = await Candidate.find_one(Candidate.phone_number == candidate.phone_number)
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Candidate with this phone number already exists"
        )
    
    # Create new candidate
    new_candidate = Candidate(**candidate.model_dump())
    await new_candidate.insert()
    
    return candidate_to_schema(new_candidate)


@router.get("/", response_model=CandidateList)
async def get_candidates(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    interested: Optional[bool] = None,
    call_status: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Get all candidates with optional filters"""
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        # Build query
        query_filters = []
        
        if search:
            query_filters.append(
                Or(
                    Candidate.candidate_name.contains(search, case_insensitive=True),
                    Candidate.phone_number.contains(search),
                    Candidate.email.contains(search, case_insensitive=True),
                    Candidate.current_company.contains(search, case_insensitive=True)
                )
            )
        
        if interested is not None:
            query_filters.append(Candidate.interested == interested)
        
        if call_status:
            query_filters.append(Candidate.call_status == call_status)
        
        # Get total count
        if query_filters:
            total = await Candidate.find(*query_filters).count()
            candidates = await Candidate.find(*query_filters).skip(skip).limit(limit).sort(-Candidate.created_at).to_list()
        else:
            total = await Candidate.find_all().count()
            candidates = await Candidate.find_all().skip(skip).limit(limit).sort(-Candidate.created_at).to_list()
        
        logger.info(f"Found {len(candidates)} candidates out of {total} total")
        
        # Convert to schema
        result_candidates = []
        for c in candidates:
            try:
                result_candidates.append(candidate_to_schema(c))
            except Exception as e:
                logger.error(f"Error converting candidate {c.id}: {str(e)}")
                raise
        
        return CandidateList(
            candidates=result_candidates,
            total=total
        )
    except Exception as e:
        logger.error(f"Error in get_candidates: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching candidates: {str(e)}"
        )


@router.get("/stats", response_model=CandidateStats)
async def get_candidate_stats(
    current_user: User = Depends(get_current_active_user)
):
    """Get candidate statistics for dashboard"""
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Total candidates
        total_candidates = await Candidate.find_all().count()
        
        # Candidates today
        candidates_today = await Candidate.find(Candidate.created_at >= today).count()
        
        # Screenings completed (candidates with screening score)
        screenings_completed = await Candidate.find(Candidate.screening_score != None).count()
        
        # Screenings today
        screenings_today = await Candidate.find(
            Candidate.screening_score != None,
            Candidate.updated_at >= today
        ).count()
        
        # Interested candidates (interested field is "yes" string in MongoDB)
        interested_candidates = await Candidate.find(Candidate.interested == "yes").count()
        
        # Not interested candidates
        not_interested_candidates = await Candidate.find(Candidate.interested == "no").count()
        
        # Calculate averages
        all_candidates = await Candidate.find_all().to_list()
        
        candidates_with_score = [c for c in all_candidates if c.screening_score is not None]
        avg_screening_score = sum(c.screening_score for c in candidates_with_score) / len(candidates_with_score) if candidates_with_score else 0.0
        
        candidates_with_exp = [c for c in all_candidates if c.experience_years is not None]
        # Convert string experience to float if needed
        exp_values = []
        for c in candidates_with_exp:
            try:
                exp_values.append(float(c.experience_years))
            except (ValueError, TypeError):
                pass
        avg_experience_years = sum(exp_values) / len(exp_values) if exp_values else 0.0
        
        candidates_with_ctc = [c for c in all_candidates if c.current_ctc_lpa is not None]
        # Convert string CTC to float if needed
        ctc_values = []
        for c in candidates_with_ctc:
            try:
                ctc_values.append(float(c.current_ctc_lpa))
            except (ValueError, TypeError):
                pass
        avg_current_ctc = sum(ctc_values) / len(ctc_values) if ctc_values else 0.0
        
        candidates_with_exp_ctc = [c for c in all_candidates if c.expected_ctc_lpa is not None]
        # Convert string expected CTC to float if needed
        exp_ctc_values = []
        for c in candidates_with_exp_ctc:
            try:
                exp_ctc_values.append(float(c.expected_ctc_lpa))
            except (ValueError, TypeError):
                pass
        avg_expected_ctc = sum(exp_ctc_values) / len(exp_ctc_values) if exp_ctc_values else 0.0
        
        return CandidateStats(
            total_candidates=total_candidates,
            candidates_today=candidates_today,
            screenings_completed=screenings_completed,
            screenings_today=screenings_today,
            interested_candidates=interested_candidates,
            not_interested_candidates=not_interested_candidates,
            avg_screening_score=round(float(avg_screening_score), 2),
            avg_experience_years=round(float(avg_experience_years), 2),
            avg_current_ctc=round(float(avg_current_ctc), 2),
            avg_expected_ctc=round(float(avg_expected_ctc), 2)
        )
    except Exception as e:
        logger.error(f"Error in get_candidate_stats: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching stats: {str(e)}"
        )


@router.get("/not-interested", response_model=CandidateList)
async def get_not_interested_candidates(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user)
):
    """Get candidates who are not interested"""
    candidates = await Candidate.find(
        Or(
            Candidate.interested == False,
            In(Candidate.call_status, ["Not Interested", "Screen Rejected"])
        )
    ).skip(skip).limit(limit).sort(-Candidate.created_at).to_list()
    
    total = await Candidate.find(
        Or(
            Candidate.interested == False,
            In(Candidate.call_status, ["Not Interested", "Screen Rejected"])
        )
    ).count()
    
    return CandidateList(
        candidates=[candidate_to_schema(c) for c in candidates],
        total=total
    )


@router.get("/unsuccessful", response_model=CandidateList)
async def get_unsuccessful_candidates(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user)
):
    """Get candidates with unsuccessful calls (rescheduled or disconnected)"""
    candidates = await Candidate.find(
        In(Candidate.call_status, ["Rescheduled", "Disconnected"])
    ).skip(skip).limit(limit).sort(-Candidate.created_at).to_list()
    
    total = await Candidate.find(
        In(Candidate.call_status, ["Rescheduled", "Disconnected"])
    ).count()
    
    return CandidateList(
        candidates=[candidate_to_schema(c) for c in candidates],
        total=total
    )


@router.get("/{candidate_id}", response_model=CandidateInDB)
async def get_candidate(
    candidate_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get candidate by ID"""
    candidate = await Candidate.get(PydanticObjectId(candidate_id))
    
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    return candidate_to_schema(candidate)


@router.get("/{candidate_id}/calls")
async def get_candidate_calls(
    candidate_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get all calls for a specific candidate"""
    # Check if candidate exists
    candidate = await Candidate.get(PydanticObjectId(candidate_id))
    
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    # Get all calls for this candidate
    calls = await Call.find(Call.candidate_id == candidate_id).sort(-Call.start_time).to_list()
    
    return {
        "candidate": candidate_to_schema(candidate),
        "calls": calls,
        "total_calls": len(calls)
    }


@router.put("/{candidate_id}", response_model=CandidateInDB)
async def update_candidate(
    candidate_id: str,
    candidate_update: CandidateUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Update candidate details"""
    candidate = await Candidate.get(PydanticObjectId(candidate_id))
    
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    # Update fields
    update_data = candidate_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(candidate, field, value)
    
    candidate.updated_at = datetime.utcnow()
    
    await candidate.save()
    
    return candidate_to_schema(candidate)


@router.delete("/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_candidate(
    candidate_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Delete candidate"""
    candidate = await Candidate.get(PydanticObjectId(candidate_id))
    
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    await candidate.delete()
    
    return None

