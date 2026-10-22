"""
Backward-compatible re-export.
The canonical pagination class is now in common.pagination.
"""
from common.pagination import StandardPagination


# Keep this alias so existing imports still work
ServicePagination = StandardPagination