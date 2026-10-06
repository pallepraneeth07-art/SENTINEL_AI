import logging
from typing import List, Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger("sentinel.supabase")

class SupabaseService:
    def __init__(self):
        self._client = None
        self._is_ready = False
        self._init_client()

    def _init_client(self):
        if not settings.has_supabase:
            logger.info("Supabase credentials not configured. Operating in high-performance memory storage mode.")
            return

        try:
            from supabase import create_client, Client
            self._client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            self._is_ready = True
            logger.info("Supabase client initialized successfully.")
        except Exception as e:
            logger.warning(f"Failed to initialize Supabase client: {e}. Falling back to memory storage.")
            self._client = None
            self._is_ready = False

    @property
    def is_connected(self) -> bool:
        return self._is_ready and self._client is not None

    def insert_audit_log(self, entry_dict: Dict[str, Any]) -> bool:
        """
        Persists a telemetry audit event into the Supabase 'audit_logs' table.
        """
        if not self.is_connected:
            return False

        try:
            self._client.table("audit_logs").insert(entry_dict).execute()
            return True
        except Exception as e:
            logger.warning(f"Supabase insert failed: {e}. Event preserved in local memory.")
            return False

    def fetch_audit_logs(self, limit: int = 50) -> Optional[List[Dict[str, Any]]]:
        """
        Retrieves recent audit logs from Supabase, ordered chronologically descending.
        """
        if not self.is_connected:
            return None

        try:
            res = (
                self._client.table("audit_logs")
                .select("*")
                .order("timestamp", desc=True)
                .limit(limit)
                .execute()
            )
            return res.data
        except Exception as e:
            logger.warning(f"Supabase query failed: {e}. Serving from local cache.")
            return None

    def clear_audit_logs(self) -> bool:
        """
        Clears audit logs in Supabase for testing sessions.
        """
        if not self.is_connected:
            return False

        try:
            # Delete all rows where id is not empty
            self._client.table("audit_logs").delete().neq("id", "").execute()
            return True
        except Exception as e:
            logger.warning(f"Supabase delete failed: {e}")
            return False


supabase_service = SupabaseService()
