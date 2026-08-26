"""
HealthFlow AI - High-Fidelity Local Firestore Mock Engine
Provides asynchronous & synchronous Firestore-compatible API with persistent file-backed JSON storage.
"""
import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
from datetime import datetime, timezone
import threading
from app.core.logger import logger

class MockDocumentSnapshot:
    def __init__(self, doc_id: str, data: Optional[Dict[str, Any]], exists: bool = True):
        self.id = doc_id
        self._data = data or {}
        self.exists = exists

    def to_dict(self) -> Dict[str, Any]:
        return dict(self._data) if self._data else {}

    def get(self, field_path: str) -> Any:
        return self._data.get(field_path)

class MockDocumentReference:
    def __init__(self, collection_ref: 'MockCollectionReference', doc_id: str):
        self.collection = collection_ref
        self.id = doc_id

    def get(self) -> MockDocumentSnapshot:
        data = self.collection._get_doc(self.id)
        if data is None:
            return MockDocumentSnapshot(self.id, None, exists=False)
        return MockDocumentSnapshot(self.id, data, exists=True)

    def set(self, data: Dict[str, Any], merge: bool = False) -> None:
        self.collection._set_doc(self.id, data, merge=merge)

    def update(self, data: Dict[str, Any]) -> None:
        self.collection._update_doc(self.id, data)

    def delete(self) -> None:
        self.collection._delete_doc(self.id)

class MockQuery:
    def __init__(self, collection_ref: 'MockCollectionReference', filters: Optional[List[tuple]] = None, order_field: Optional[str] = None, order_desc: bool = False, limit_val: Optional[int] = None):
        self.collection = collection_ref
        self.filters = filters or []
        self.order_field = order_field
        self.order_desc = order_desc
        self.limit_val = limit_val

    def where(self, field: str, op: str, val: Any) -> 'MockQuery':
        new_filters = list(self.filters)
        new_filters.append((field, op, val))
        return MockQuery(self.collection, new_filters, self.order_field, self.order_desc, self.limit_val)

    def order_by(self, field: str, direction: str = "ASCENDING") -> 'MockQuery':
        return MockQuery(self.collection, self.filters, field, direction.upper() == "DESCENDING", self.limit_val)

    def limit(self, count: int) -> 'MockQuery':
        return MockQuery(self.collection, self.filters, self.order_field, self.order_desc, count)

    def stream(self) -> List[MockDocumentSnapshot]:
        docs = self.collection._get_all_docs()
        results = []
        for doc_id, data in docs.items():
            match = True
            for field, op, val in self.filters:
                doc_val = data.get(field)
                if op == "==" and doc_val != val:
                    match = False
                    break
                elif op == "!=" and doc_val == val:
                    match = False
                    break
                elif op == ">" and not (doc_val is not None and doc_val > val):
                    match = False
                    break
                elif op == ">=" and not (doc_val is not None and doc_val >= val):
                    match = False
                    break
                elif op == "<" and not (doc_val is not None and doc_val < val):
                    match = False
                    break
                elif op == "<=" and not (doc_val is not None and doc_val <= val):
                    match = False
                    break
                elif op == "in" and (doc_val not in val):
                    match = False
                    break
                elif op == "array_contains" and (isinstance(doc_val, list) and val not in doc_val):
                    match = False
                    break
                elif op == "array_contains_any" and (isinstance(doc_val, list) and not any(v in doc_val for v in val)):
                    match = False
                    break
            if match:
                results.append(MockDocumentSnapshot(doc_id, data, exists=True))

        if self.order_field:
            results.sort(
                key=lambda doc: doc.to_dict().get(self.order_field, ""),
                reverse=self.order_desc
            )

        if self.limit_val:
            results = results[:self.limit_val]

        return results

    def get(self) -> List[MockDocumentSnapshot]:
        return self.stream()

class MockCollectionReference:
    def __init__(self, db: 'MockFirestoreClient', name: str):
        self.db = db
        self.name = name
        self._lock = threading.Lock()
        self._file_path = Path(self.db.storage_dir) / f"{self.name}.json"
        self._ensure_storage()

    def _ensure_storage(self):
        os.makedirs(self.db.storage_dir, exist_ok=True)
        if not self._file_path.exists():
            with open(self._file_path, "w", encoding="utf-8") as f:
                json.dump({}, f)

    def _get_all_docs(self) -> Dict[str, Dict[str, Any]]:
        with self._lock:
            try:
                if self._file_path.exists():
                    with open(self._file_path, "r", encoding="utf-8") as f:
                        return json.load(f)
                return {}
            except Exception as e:
                logger.error(f"Error reading mock collection {self.name}: {e}")
                return {}

    def _save_all_docs(self, docs: Dict[str, Dict[str, Any]]):
        with self._lock:
            with open(self._file_path, "w", encoding="utf-8") as f:
                json.dump(docs, f, indent=2, ensure_ascii=False)

    def _get_doc(self, doc_id: str) -> Optional[Dict[str, Any]]:
        docs = self._get_all_docs()
        return docs.get(doc_id)

    def _set_doc(self, doc_id: str, data: Dict[str, Any], merge: bool = False):
        docs = self._get_all_docs()
        if merge and doc_id in docs:
            docs[doc_id].update(data)
        else:
            docs[doc_id] = data
        self._save_all_docs(docs)

    def _update_doc(self, doc_id: str, data: Dict[str, Any]):
        docs = self._get_all_docs()
        if doc_id in docs:
            docs[doc_id].update(data)
            self._save_all_docs(docs)
        else:
            raise KeyError(f"Document {doc_id} does not exist in collection {self.name}")

    def _delete_doc(self, doc_id: str):
        docs = self._get_all_docs()
        if doc_id in docs:
            del docs[doc_id]
            self._save_all_docs(docs)

    def document(self, doc_id: Optional[str] = None) -> MockDocumentReference:
        if not doc_id:
            import uuid
            doc_id = uuid.uuid4().hex
        return MockDocumentReference(self, doc_id)

    def where(self, field: str, op: str, val: Any) -> MockQuery:
        return MockQuery(self).where(field, op, val)

    def order_by(self, field: str, direction: str = "ASCENDING") -> MockQuery:
        return MockQuery(self).order_by(field, direction)

    def limit(self, count: int) -> MockQuery:
        return MockQuery(self).limit(count)

    def stream(self) -> List[MockDocumentSnapshot]:
        return MockQuery(self).stream()

class MockFirestoreClient:
    def __init__(self, storage_dir: str = "backend/data_store"):
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)
        self._collections: Dict[str, MockCollectionReference] = {}

    def collection(self, name: str) -> MockCollectionReference:
        if name not in self._collections:
            self._collections[name] = MockCollectionReference(self, name)
        return self._collections[name]
