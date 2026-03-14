# Testing POST APIs Without the Frontend

Replace `YOUR_WEB_APP_URL` with your deployed Apps Script URL (e.g. `https://script.google.com/macros/s/xxxxx/exec`) and `YOUR_SECRET_KEY` with the value of `SECRET_KEY` in Code.gs.

---

## 1. Create Seva (createSeva)

**curl (Windows PowerShell):**
```powershell
$body = @{
  action = "createSeva"
  secretKey = "YOUR_SECRET_KEY"
  seva_name = "Morning Aarti"
  description = "Daily morning aarti"
  start_time = "08:00"
  end_time = "08:30"
  recurrence_type = "weekly"
  recurrence_days = "Mon,Tue,Wed,Thu,Fri,Sat,Sun"
} | ConvertTo-Json

Invoke-RestMethod -Uri "YOUR_WEB_APP_URL?action=createSeva" -Method Post -Body $body -ContentType "text/plain; charset=utf-8"
```

**curl (bash / Git Bash / WSL):**
```bash
curl -X POST "YOUR_WEB_APP_URL?action=createSeva" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"action":"createSeva","secretKey":"YOUR_SECRET_KEY","seva_name":"Morning Aarti","description":"Daily morning aarti","start_time":"08:00","end_time":"08:30","recurrence_type":"weekly","recurrence_days":"Mon,Tue,Wed,Thu,Fri,Sat,Sun"}'
```

---

## 2. Create Sevekari (createSevekari)

**curl (bash):**
```bash
curl -X POST "YOUR_WEB_APP_URL?action=createSevekari" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"action":"createSevekari","secretKey":"YOUR_SECRET_KEY","name":"Test Person","phone":"1234567890","email":"test@example.com","availability_days":"Mon,Wed,Fri","notes":"Available mornings"}'
```

---

## 3. Assign Seva (assignSeva)

Requires an existing `seva_id` and `sevekari_id` from your sheets (create a Seva and Sevekari first, then use their IDs).

**curl (bash):**
```bash
curl -X POST "YOUR_WEB_APP_URL?action=assignSeva" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"action":"assignSeva","secretKey":"YOUR_SECRET_KEY","seva_id":"SEVA-1234567890","sevekari_id":"SEVEKARI-1234567890","start_date":"2025-03-01","end_date":"2025-03-31","recurrence_type":"weekly","recurrence_days":"Mon,Wed"}'
```

---

## Postman

1. **Method:** POST  
2. **URL:** `YOUR_WEB_APP_URL?action=createSeva` (or `createSevekari` / `assignSeva`)  
3. **Headers:**  
   - `Content-Type`: `text/plain;charset=utf-8`  
4. **Body:** raw → Text, then paste JSON, e.g.:

```json
{
  "action": "createSeva",
  "secretKey": "YOUR_SECRET_KEY",
  "seva_name": "Morning Aarti",
  "description": "Daily morning aarti",
  "start_time": "08:00",
  "end_time": "08:30",
  "recurrence_type": "weekly",
  "recurrence_days": "Mon,Tue,Wed,Thu,Fri,Sat,Sun"
}
```

- For **createSevekari** use `action: "createSevekari"` and fields: `name`, `phone`, `email`, `availability_days`, `notes`.  
- For **assignSeva** use `action: "assignSeva"` and fields: `seva_id`, `sevekari_id`, `start_date`, `end_date`, `recurrence_type`, `recurrence_days`.

Success responses are JSON with `"success": true` and optional `data`. Errors return `"success": false` and a `"message"` (e.g. "Unauthorized", "Invalid action", "Sheet not found").
