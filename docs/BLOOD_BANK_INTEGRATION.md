# HealthFlow AI — Blood Bank & e-RaktKosh Integration

## 1. e-RaktKosh Architecture
HealthFlow AI integrates with the **National Blood Transfusion Council (e-RaktKosh)** portal to provide real-time blood and blood component availability.

### Supported Blood Groups & Components
- Whole Blood: `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`
- Specialized Components: `Single Donor Platelets (SDP)`, `Random Donor Platelets (RDP)`, `Fresh Frozen Plasma (FFP)`

## 2. Integrity & Freshness Guarantees
- **No False Live Claims**: Every blood bank result displays the authoritative source organization, verified contact telephone, and explicit `last_updated` timestamp.
- **Proximity Geolocation**: Uses Haversine spherical distance calculation to rank blood banks by distance (in kilometers) from the user's current GPS location.
