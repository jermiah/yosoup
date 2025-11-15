"""
FastAPI REST API server for WhatsApp MCP tools
This wraps all MCP tools and exposes them as HTTP endpoints for voice assistant integration
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Any
import traceback

from whatsapp import (
    search_contacts as whatsapp_search_contacts,
    list_messages as whatsapp_list_messages,
    list_chats as whatsapp_list_chats,
    get_chat as whatsapp_get_chat,
    get_direct_chat_by_contact as whatsapp_get_direct_chat_by_contact,
    get_contact_chats as whatsapp_get_contact_chats,
    get_last_interaction as whatsapp_get_last_interaction,
    get_message_context as whatsapp_get_message_context,
    send_message as whatsapp_send_message,
    send_file as whatsapp_send_file,
    send_audio_message as whatsapp_audio_voice_message,
    download_media as whatsapp_download_media
)

# Initialize FastAPI app
app = FastAPI(
    title="WhatsApp Voice Assistant API",
    description="REST API for WhatsApp integration with voice assistants for blind users",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response validation
class SuccessResponse(BaseModel):
    success: bool = True
    data: Any

class ErrorResponse(BaseModel):
    success: bool = False
    error: str

class SearchContactsRequest(BaseModel):
    query: str = Field(..., description="Search term to match against contact names or phone numbers")

class ListMessagesRequest(BaseModel):
    after: Optional[str] = Field(None, description="ISO-8601 date string to only return messages after this date")
    before: Optional[str] = Field(None, description="ISO-8601 date string to only return messages before this date")
    sender_phone_number: Optional[str] = Field(None, description="Phone number to filter messages by sender")
    chat_jid: Optional[str] = Field(None, description="Chat JID to filter messages by chat")
    query: Optional[str] = Field(None, description="Search term to filter messages by content")
    limit: int = Field(20, description="Maximum number of messages to return")
    page: int = Field(0, description="Page number for pagination")
    include_context: bool = Field(True, description="Whether to include messages before and after matches")
    context_before: int = Field(1, description="Number of messages to include before each match")
    context_after: int = Field(1, description="Number of messages to include after each match")

class ListChatsRequest(BaseModel):
    query: Optional[str] = Field(None, description="Search term to filter chats by name or JID")
    limit: int = Field(20, description="Maximum number of chats to return")
    page: int = Field(0, description="Page number for pagination")
    include_last_message: bool = Field(True, description="Whether to include the last message in each chat")
    sort_by: str = Field("last_active", description="Field to sort results by (last_active or name)")

class GetChatRequest(BaseModel):
    chat_jid: str = Field(..., description="The JID of the chat to retrieve")
    include_last_message: bool = Field(True, description="Whether to include the last message")

class GetDirectChatByContactRequest(BaseModel):
    sender_phone_number: str = Field(..., description="The phone number to search for")

class GetContactChatsRequest(BaseModel):
    jid: str = Field(..., description="The contact's JID to search for")
    limit: int = Field(20, description="Maximum number of chats to return")
    page: int = Field(0, description="Page number for pagination")

class GetLastInteractionRequest(BaseModel):
    jid: str = Field(..., description="The JID of the contact to search for")

class GetMessageContextRequest(BaseModel):
    message_id: str = Field(..., description="The ID of the message to get context for")
    before: int = Field(5, description="Number of messages to include before the target message")
    after: int = Field(5, description="Number of messages to include after the target message")

class SendMessageRequest(BaseModel):
    recipient: str = Field(..., description="Phone number (with country code, no +) or JID (e.g., 123456789@s.whatsapp.net or 123456789@g.us for groups)")
    message: str = Field(..., description="The message text to send")

class SendFileRequest(BaseModel):
    recipient: str = Field(..., description="Phone number or JID")
    media_path: str = Field(..., description="Absolute path to the media file to send")

class SendAudioRequest(BaseModel):
    recipient: str = Field(..., description="Phone number or JID")
    media_path: str = Field(..., description="Absolute path to the audio file to send")

class DownloadMediaRequest(BaseModel):
    message_id: str = Field(..., description="The ID of the message containing the media")
    chat_jid: str = Field(..., description="The JID of the chat containing the message")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "WhatsApp Voice Assistant API"}

# Contact endpoints
@app.post("/api/contacts/search", response_model=SuccessResponse)
async def search_contacts(request: SearchContactsRequest):
    """
    Search WhatsApp contacts by name or phone number.

    Returns a list of matching contacts with their phone numbers, names, and JIDs.
    """
    try:
        contacts = whatsapp_search_contacts(request.query)
        return SuccessResponse(data=contacts)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Chat endpoints
@app.post("/api/chats/list", response_model=SuccessResponse)
async def list_chats(request: ListChatsRequest):
    """
    Get WhatsApp chats matching specified criteria.

    Returns a paginated list of chats with metadata and optional last message.
    """
    try:
        chats = whatsapp_list_chats(
            query=request.query,
            limit=request.limit,
            page=request.page,
            include_last_message=request.include_last_message,
            sort_by=request.sort_by
        )
        return SuccessResponse(data=chats)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chats/get", response_model=SuccessResponse)
async def get_chat(request: GetChatRequest):
    """
    Get WhatsApp chat metadata by JID.

    Returns detailed information about a specific chat.
    """
    try:
        chat = whatsapp_get_chat(request.chat_jid, request.include_last_message)
        return SuccessResponse(data=chat)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chats/get_by_contact", response_model=SuccessResponse)
async def get_direct_chat_by_contact(request: GetDirectChatByContactRequest):
    """
    Get WhatsApp chat by contact phone number.

    Finds the direct chat with a specific contact using their phone number.
    """
    try:
        chat = whatsapp_get_direct_chat_by_contact(request.sender_phone_number)
        return SuccessResponse(data=chat)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chats/by_contact", response_model=SuccessResponse)
async def get_contact_chats(request: GetContactChatsRequest):
    """
    Get all chats involving a specific contact.

    Returns both direct chats and group chats where the contact is a member.
    """
    try:
        chats = whatsapp_get_contact_chats(
            request.jid,
            limit=request.limit,
            page=request.page
        )
        return SuccessResponse(data=chats)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Message endpoints
@app.post("/api/messages/list", response_model=SuccessResponse)
async def list_messages(request: ListMessagesRequest):
    """
    Get WhatsApp messages matching specified criteria with optional context.

    Supports filtering by date, sender, chat, and content search.
    Returns paginated results with optional surrounding message context.
    """
    try:
        messages = whatsapp_list_messages(
            after=request.after,
            before=request.before,
            sender_phone_number=request.sender_phone_number,
            chat_jid=request.chat_jid,
            query=request.query,
            limit=request.limit,
            page=request.page,
            include_context=request.include_context,
            context_before=request.context_before,
            context_after=request.context_after
        )
        return SuccessResponse(data=messages)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/messages/last_interaction", response_model=SuccessResponse)
async def get_last_interaction(request: GetLastInteractionRequest):
    """
    Get most recent message with a contact.

    Returns the latest message in the conversation with the specified contact.
    """
    try:
        message = whatsapp_get_last_interaction(request.jid)
        return SuccessResponse(data=message)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/messages/context", response_model=SuccessResponse)
async def get_message_context(request: GetMessageContextRequest):
    """
    Get context around a specific message.

    Returns the target message along with surrounding messages for context.
    """
    try:
        context = whatsapp_get_message_context(
            request.message_id,
            before=request.before,
            after=request.after
        )
        return SuccessResponse(data=context)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Send endpoints
@app.post("/api/send/message", response_model=SuccessResponse)
async def send_message(request: SendMessageRequest):
    """
    Send a WhatsApp message to a person or group.

    Supports sending to:
    - Phone numbers (with country code, no + or symbols)
    - Direct chat JIDs (e.g., 123456789@s.whatsapp.net)
    - Group JIDs (e.g., 123456789@g.us)
    """
    try:
        success, status_message = whatsapp_send_message(request.recipient, request.message)

        if success:
            return SuccessResponse(data={"message": status_message})
        else:
            raise HTTPException(status_code=500, detail=status_message)
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/send/file", response_model=SuccessResponse)
async def send_file(request: SendFileRequest):
    """
    Send a file (image, video, raw audio, document) via WhatsApp.

    The file must exist at the specified absolute path.
    """
    try:
        success, status_message = whatsapp_send_file(request.recipient, request.media_path)

        if success:
            return SuccessResponse(data={"message": status_message})
        else:
            raise HTTPException(status_code=500, detail=status_message)
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/send/audio", response_model=SuccessResponse)
async def send_audio_message(request: SendAudioRequest):
    """
    Send an audio file as a WhatsApp voice message.

    Audio files should be in .ogg Opus format for best compatibility.
    If FFmpeg is installed, other formats will be automatically converted.
    """
    try:
        success, status_message = whatsapp_audio_voice_message(request.recipient, request.media_path)

        if success:
            return SuccessResponse(data={"message": status_message})
        else:
            raise HTTPException(status_code=500, detail=status_message)
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Media endpoints
@app.post("/api/media/download", response_model=SuccessResponse)
async def download_media(request: DownloadMediaRequest):
    """
    Download media from a WhatsApp message.

    Returns the local file path where the media was saved.
    """
    try:
        file_path = whatsapp_download_media(request.message_id, request.chat_jid)

        if file_path:
            return SuccessResponse(data={
                "message": "Media downloaded successfully",
                "file_path": file_path
            })
        else:
            raise HTTPException(status_code=500, detail="Failed to download media")
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    import os
    
    # Get port from environment variable (Cloud Run sets PORT=8080)
    port = int(os.environ.get("PORT", 8080))
    
    print(f"🚀 Starting WhatsApp Voice Assistant API on http://0.0.0.0:{port}")
    print(f"📝 Interactive API docs available at http://localhost:{port}/docs")
    print(f"📚 Alternative docs available at http://localhost:{port}/redoc")
    print(f"💚 Health check available at http://localhost:{port}/health")
    uvicorn.run(app, host="0.0.0.0", port=port)
