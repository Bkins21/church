# Security Specification

## 1. Data Invariants
- **Public Create Access**: Registration is a public church event registration form. Anyone (even unauthenticated clients) can create a registration document.
- **Strict Payload Type & Size Validation**: All string fields in a registration must conform to maximum length bounds to prevent "Denial of Wallet" size attacks.
- **PII Protection**: Blanket listing (`list` queries) of registrations is strictly forbidden to general users. Only verified administrators can list or query registrations.
- **Single Ticket Retrieval**: Single document lookups (`get`) are allowed to retrieve individual registration tickets, but only if the document ID is known.
- **Immutable Registrations**: Once a registration document is created, it cannot be updated or modified by regular users.
- **Admin Privilege Escalate Shield**: Only authenticated accounts explicitly marked in `/admins/{adminId}` can delete or update registrations.

## 2. The "Dirty Dozen" Payloads
The following payloads describe 12 distinct attacks that must be blocked by the Firestore security rules:
1. **Unbounded Username Payload**: A registration payload where `userName` has an astronomical length (e.g., 5MB of text) to consume storage.
2. **PII Query Harvesting**: An unauthenticated user attempting to `list` all documents in the `registrations` collection.
3. **Malicious ID Injection**: A registration request trying to use an abnormally long, invalid document path/ID containing special characters (e.g. `/registrations/../../../etc`).
4. **Illegal Field Injection**: A payload containing extra unrequested fields like `isAdmin: true` or `role: 'owner'`.
5. **Unauthorized Registration Update**: An authenticated regular user attempting to update their branch or attendance mode on an existing registration document.
6. **Unauthorized Registration Deletion**: An unauthenticated user attempting to delete another participant's registration.
7. **Invalid Format/Type Injection**: Setting `mode` to an unapproved string like `"unknown"` or a boolean `true`.
8. **Missing Mandatory Fields**: Attempting to create a registration missing critical fields like `userEmail` or `ticketCode`.
9. **Fake Ticket Code Attack**: Creating a registration with an abnormally long, unstructured ticket code.
10. **Admin Spoofing**: Trying to write directly to `/admins/{anyUserId}` to grant oneself administrative access.
11. **Admin Override Block**: A non-admin user trying to update a terminal registration field.
12. **Malicious Contact Number**: A `userPhone` field carrying special escape characters or excessively long buffers.

## 3. Test Cases (TDD)
- All test payloads targeting unauthorized read/write or invalid size/type constraints must return `PERMISSION_DENIED`.
