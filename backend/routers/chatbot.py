"""
Chatbot router - handles chatbot messages and conversation history
"""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime
import uuid

from models import (
    ChatRequest,
    ChatResponse,
    ChatMessageResponse,
    MessageSender
)
from auth_utils import get_optional_current_user, TokenData
from database import select, insert, update, delete, execute_raw

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])


# Predefined responses for the chatbot (can be extended with AI later)
CHATBOT_RESPONSES = {
    "fr": {
        "greeting": "Bonjour! Je suis l'assistant AeroWay. Comment puis-je vous aider aujourd'hui?",
        "help": "Je peux vous aider avec: les informations de vol, la navigation dans l'aéroport, les services disponibles, et bien plus encore.",
        "flight_info": "Pour obtenir des informations sur votre vol, veuillez me donner votre numéro de vol ou de billet.",
        "navigation": "Je peux vous guider vers votre porte d'embarquement, les toilettes, les restaurants, ou tout autre lieu dans l'aéroport.",
        "services": "L'aéroport offre des boutiques duty-free, restaurants, cafés, salons, et bien d'autres services. Que recherchez-vous?",
        "delay": "En cas de retard, vérifiez les écrans d'information ou je vous enverrai une notification automatique.",
        "default": "Je comprends votre question. Laissez-moi vous aider avec cela. Vous pouvez me demander des informations sur les vols, les services, ou la navigation dans l'aéroport."
    },
    "en": {
        "greeting": "Hello! I'm the AeroWay assistant. How can I help you today?",
        "help": "I can help you with: flight information, airport navigation, available services, and much more.",
        "flight_info": "To get information about your flight, please provide your flight or ticket number.",
        "navigation": "I can guide you to your boarding gate, restrooms, restaurants, or any other location in the airport.",
        "services": "The airport offers duty-free shops, restaurants, cafes, lounges, and many other services. What are you looking for?",
        "delay": "In case of delay, check the information screens or I will send you an automatic notification.",
        "default": "I understand your question. Let me help you with that. You can ask me about flights, services, or airport navigation."
    },
    "ar": {
        "greeting": "مرحبا! أنا مساعد AeroWay. كيف يمكنني مساعدتك اليوم؟",
        "help": "يمكنني مساعدتك في: معلومات الرحلة، التنقل في المطار، الخدمات المتاحة، وأكثر من ذلك بكثير.",
        "flight_info": "للحصول على معلومات حول رحلتك، يرجى تقديم رقم رحلتك أو رقم التذكرة.",
        "navigation": "يمكنني إرشادك إلى بوابة الصعود، دورات المياه، المطاعم، أو أي موقع آخر في المطار.",
        "services": "يوفر المطار متاجر معفاة من الرسوم الجمركية ومطاعم ومقاهي وصالات وخدمات أخرى كثيرة. ماذا تبحث؟",
        "delay": "في حالة التأخير، تحقق من شاشات المعلومات أو سأرسل لك إشعارًا تلقائيًا.",
        "default": "أفهم سؤالك. دعني أساعدك في ذلك. يمكنك سؤالي عن الرحلات أو الخدمات أو التنقل في المطار."
    }
}


def get_bot_response(message: str, language: str = "fr") -> str:
    """
    Generate a bot response based on the user message

    Args:
        message: User message
        language: Language code (fr, en, ar)

    Returns:
        str: Bot response
    """
    message_lower = message.lower()
    responses = CHATBOT_RESPONSES.get(language, CHATBOT_RESPONSES["fr"])

    # Keyword matching for different topics
    if any(word in message_lower for word in ["bonjour", "hello", "salut", "hi", "مرحبا", "السلام"]):
        return responses["greeting"]

    if any(word in message_lower for word in ["aide", "help", "assistance", "مساعدة"]):
        return responses["help"]

    if any(word in message_lower for word in ["vol", "flight", "avion", "رحلة", "طائرة"]):
        return responses["flight_info"]

    if any(word in message_lower for word in ["navigation", "navigate", "carte", "map", "où", "where", "أين", "خريطة"]):
        return responses["navigation"]

    if any(word in message_lower for word in ["service", "restaurant", "shop", "boutique", "café", "متجر", "مطعم"]):
        return responses["services"]

    if any(word in message_lower for word in ["retard", "delay", "late", "تأخير"]):
        return responses["delay"]

    return responses["default"]


@router.post("", response_model=ChatResponse)
async def process_chatbot_message(
    chat_request: ChatRequest,
    current_user: Optional[TokenData] = Depends(get_optional_current_user)
):
    """
    Process a chatbot message and return a response

    Args:
        chat_request: Chat request with message and metadata
        current_user: Optional current user

    Returns:
        ChatResponse: Bot response

    Raises:
        HTTPException: If processing fails
    """
    try:
        user_id = current_user.user_id if current_user else None
        session_id = chat_request.session_id or str(uuid.uuid4())

        # Save user message to database
        user_message_data = {
            "user_id": user_id,
            "session_id": session_id,
            "sender": MessageSender.USER.value,
            "message_text": chat_request.message,
            "timestamp": datetime.utcnow()
        }

        await insert("messages", data=user_message_data)

        # Generate bot response
        bot_response_text = get_bot_response(chat_request.message, chat_request.language)

        # Save bot response to database
        bot_message_data = {
            "user_id": user_id,
            "session_id": session_id,
            "sender": MessageSender.BOT.value,
            "message_text": bot_response_text,
            "timestamp": datetime.utcnow()
        }

        await insert("messages", data=bot_message_data)

        return ChatResponse(
            message=bot_response_text,
            sender="bot",
            timestamp=datetime.utcnow(),
            session_id=session_id
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process chatbot message: {str(e)}"
        )


@router.get("/history/{session_id}", response_model=List[ChatMessageResponse])
async def get_chat_history(
    session_id: str,
    limit: int = 50,
    current_user: Optional[TokenData] = Depends(get_optional_current_user)
):
    """
    Get chat history for a session

    Args:
        session_id: Session ID
        limit: Maximum number of messages to return
        current_user: Optional current user

    Returns:
        List[ChatMessageResponse]: List of chat messages

    Raises:
        HTTPException: If retrieval fails
    """
    try:
        # Build where clause
        where = {"session_id": session_id}

        # If user is authenticated, only return their messages
        if current_user:
            where["user_id"] = current_user.user_id

        messages_data = await select(
            "messages",
            where=where,
            order_by="timestamp ASC",
            limit=limit
        )

        messages = [
            ChatMessageResponse(
                id=msg["id"],
                user_id=msg.get("user_id"),
                session_id=msg["session_id"],
                sender=msg["sender"],
                message_text=msg["message_text"],
                timestamp=msg["timestamp"]
            )
            for msg in messages_data
        ]

        return messages

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve chat history: {str(e)}"
        )


@router.get("/user-history", response_model=List[ChatMessageResponse])
async def get_user_chat_history(
    limit: int = 100,
    current_user: TokenData = Depends(get_optional_current_user)
):
    """
    Get all chat history for the current user

    Args:
        limit: Maximum number of messages to return
        current_user: Current authenticated user

    Returns:
        List[ChatMessageResponse]: List of user's chat messages

    Raises:
        HTTPException: If retrieval fails or user not authenticated
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    try:
        messages_data = await select(
            "messages",
            where={"user_id": current_user.user_id},
            order_by="timestamp DESC",
            limit=limit
        )

        messages = [
            ChatMessageResponse(
                id=msg["id"],
                user_id=msg.get("user_id"),
                session_id=msg["session_id"],
                sender=msg["sender"],
                message_text=msg["message_text"],
                timestamp=msg["timestamp"]
            )
            for msg in messages_data
        ]

        return messages

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user chat history: {str(e)}"
        )


@router.delete("/history/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat_history(
    session_id: str,
    current_user: TokenData = Depends(get_optional_current_user)
):
    """
    Delete chat history for a session

    Args:
        session_id: Session ID
        current_user: Current authenticated user

    Raises:
        HTTPException: If deletion fails or unauthorized
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    try:
        # Delete messages for this session and user
        await delete(
            "messages",
            where={
                "session_id": session_id,
                "user_id": current_user.user_id
            }
        )

        return None

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete chat history: {str(e)}"
        )
