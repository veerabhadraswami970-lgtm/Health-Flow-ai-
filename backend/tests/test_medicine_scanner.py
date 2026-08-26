"""
HealthFlow AI - Medicine Scanner Unit Tests
"""
import pytest
from io import BytesIO
from starlette.datastructures import UploadFile
from app.services.medicine_scanner_service import medicine_scanner_service

@pytest.mark.asyncio
async def test_medicine_scanner_upload():
    fake_file = UploadFile(
        filename="dolo_650_strip.jpg",
        file=BytesIO(b"dummy image data for dolo 650")
    )
    result = await medicine_scanner_service.scan_image(fake_file)
    assert result.scan_id is not None
    assert len(result.items) > 0
    assert any("Dolo" in item.name or "Paracetamol" in item.name for item in result.items)

@pytest.mark.asyncio
async def test_medicine_scanner_telma_fallback():
    fake_file = UploadFile(
        filename="telma_40_packaging.jpg",
        file=BytesIO(b"dummy image data for telma 40")
    )
    result = await medicine_scanner_service.scan_image(fake_file)
    assert result.scan_id is not None
    assert len(result.items) > 0
    assert any("Telma" in item.name or "Telmisartan" in item.name for item in result.items)

