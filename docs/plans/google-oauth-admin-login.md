# Kế hoạch thêm đăng nhập Google cho Admin UI

## 1. Mục tiêu

Thêm lựa chọn **Continue with Google** tại màn đăng nhập Admin UI, đồng thời giữ nguyên luồng email/password hiện tại.

Kết quả cuối cùng:

- Google chỉ xác thực danh tính; quyền admin vẫn do CIS quyết định.
- Chỉ admin đã tồn tại và đang `enabled` mới được đăng nhập.
- Không tự tạo admin từ tài khoản Google.
- Sau khi Google xác thực thành công, hệ thống vẫn phát hành CIS JWT giống luồng password hiện tại.
- Không lưu Google access token, refresh token hoặc ID token.
- Có feature flag để tắt Google login mà không ảnh hưởng password login.

## 2. Quyết định kiến trúc

Sử dụng **Google Identity Services (GIS)** theo luồng Sign in with Google bằng OpenID Connect ID token, không dùng authorization-code OAuth đầy đủ.

Lý do:

- Nhu cầu hiện tại chỉ là đăng nhập, không gọi Google Drive, Calendar hoặc API Google khác.
- Không cần xin scope ngoài `openid`, `email`, `profile`.
- Không cần client secret, callback URL phía server, access token hoặc refresh token.
- Backend xác minh ID token bằng thư viện chính thức `google-auth-library` và chỉ tin token sau khi kiểm tra chữ ký, `aud`, `iss`, thời hạn và `nonce`.
- Dùng claim `sub` làm định danh Google ổn định; email chỉ dùng để liên kết lần đầu với admin đã tồn tại.

Thiết kế UI tiếp tục theo hướng **Modern Operations Console** hiện có: card đăng nhập ở giữa, hai phương thức đăng nhập được phân tách rõ ràng, không redesign toàn bộ màn hình. Framework giữ nguyên Tabler + vanilla JavaScript.

## 3. Phạm vi

### Trong phạm vi

- Cấu hình Google login theo môi trường.
- Migration liên kết một admin CIS với một Google account.
- Gateway xác minh Google ID token.
- API lấy cấu hình đăng nhập Google và API đăng nhập bằng Google.
- Nút Google chính thức trong Admin UI.
- Dùng chung cơ chế phát hành CIS JWT, logout, `/me` và redirect `next` hiện có.
- Unit/integration test, Admin UI E2E, tài liệu vận hành và rollout.

### Ngoài phạm vi

- Tự động tạo admin từ Google account.
- Google-only account không có password.
- Bắt buộc toàn hệ thống chỉ đăng nhập bằng Google.
- Google One Tap hoặc tự động mở popup khi vào trang.
- Xin quyền hoặc gọi Google Drive, Calendar, Gmail.
- Lưu access token/refresh token.
- UI liên kết, hủy liên kết hoặc đổi Google account.
- Xây framework OAuth tổng quát cho nhiều provider.

## 4. Luồng đăng nhập

1. Admin UI gọi `GET /api/v1/auth/google/config`.
2. API trả trạng thái bật/tắt, public client ID và một login nonce ngắn hạn; đồng thời đặt cookie challenge `HttpOnly`, `SameSite=Lax`.
3. Nếu Google login được bật, FE tải Google Identity Services script và render nút Google chính thức.
4. Người dùng chọn Google account.
5. GIS trả ID token qua JavaScript callback.
6. FE gửi ID token đến `POST /api/v1/auth/google`; không tự decode token để ra quyết định quyền.
7. Backend xác minh token với đúng Google client ID và kiểm tra nonce/challenge.
8. Backend tìm admin theo `google_subject`:
   - Nếu đã liên kết: kiểm tra admin còn `enabled` rồi đăng nhập.
   - Nếu chưa liên kết: tìm admin đã tồn tại theo email Google hợp lệ, sau đó liên kết `sub` một lần bằng transaction.
   - Nếu không có admin phù hợp, admin bị disable hoặc có xung đột liên kết: từ chối.
9. Backend phát hành CIS JWT bằng cùng một hàm với password login.
10. FE lưu CIS JWT theo cơ chế hiện tại, xóa project selection cũ và redirect đến `next` đã được kiểm tra bằng `CIS.safePath`.

## 5. Cấu hình

Thêm cấu hình trong `src/config/env.js` và tài liệu biến môi trường:

```text
GOOGLE_OAUTH_ENABLED=false
GOOGLE_OAUTH_CLIENT_ID=<public Google OAuth web client id>
```

Quy tắc:

- Mặc định `GOOGLE_OAUTH_ENABLED=false` để rollout an toàn.
- Khi bật mà thiếu client ID, config phải báo lỗi rõ ràng thay vì âm thầm bỏ qua.
- Client ID là public configuration; không xem là secret.
- Không thêm `GOOGLE_CLIENT_SECRET` vì luồng này không sử dụng authorization code.
- Không commit credential vào repository hoặc file mẫu có giá trị thật.

Google Cloud Console cần cấu hình OAuth Web Client với Authorized JavaScript Origins chính xác:

- Local: `http://localhost:3001`.
- Production: origin HTTPS thật của Admin UI.

Không dùng wildcard origin.

## 6. Thay đổi dữ liệu

Thêm migration cho bảng `admin_users`:

```text
google_subject TEXT NULL
```

Thêm unique partial index cho các bản ghi có `google_subject IS NOT NULL`.

Quy tắc liên kết:

- Một Google `sub` chỉ thuộc một admin.
- Một admin chỉ liên kết với một Google `sub`.
- Lần đầu đăng nhập có thể liên kết theo email chỉ khi token đã được xác minh và email đủ tin cậy.
- Gmail được chấp nhận khi email đã verify.
- Google Workspace được chấp nhận khi `email_verified=true` và có claim `hd`.
- Tài khoản Google dùng email bên thứ ba nhưng không có `hd` không được tự liên kết chỉ dựa vào email; người dùng vẫn có thể dùng password.
- Nếu admin đã liên kết với `sub` khác, trả lỗi; không tự ghi đè.
- Không làm nullable password ở phase này.

`AdminUserRepository` cần thêm:

- `findByGoogleSubject(googleSubject)`.
- `bindGoogleSubject({ adminId, googleSubject })` theo compare-and-set/transaction.
- Giữ nguyên `findByEmail`, `touchLogin` và các contract cũ.

## 7. Backend

### 7.1 External gateway

Tạo `src/infrastructure/external/google/GoogleIdentityClient.js`.

Trách nhiệm:

- Bọc `google-auth-library`.
- Xác minh ID token với `audience = GOOGLE_OAUTH_CLIENT_ID`.
- Trả payload trung tính cho Auth application.
- Chuẩn hóa lỗi Google thành lỗi nội bộ; không để raw provider error hoặc token lọt ra response/log.

Module Auth không tự gọi Google HTTP endpoint và không tự xử lý chữ ký JWT của Google.

### 7.2 Auth application

Thêm các use case:

- `getGoogleLoginConfig`: trả config public và phát challenge/nonce ngắn hạn, mục đích riêng `google_login_nonce`, dự kiến hết hạn sau 5 phút.
- `loginWithGoogle`: xác minh feature flag, credential, Google token, challenge, danh tính admin và liên kết account.

Tách phần phát hành CIS JWT đang nằm trong password login thành `issueAdminSession` để cả hai luồng dùng chung. Không thay đổi claims, TTL hoặc hành vi JWT hiện có.

`AuthApi` export hai use case mới nhưng các module khác vẫn chỉ truy cập Auth qua public API của module.

### 7.3 HTTP API

Thêm route public:

```http
GET /api/v1/auth/google/config
```

Response khi bật:

```json
{
  "google": {
    "enabled": true,
    "client_id": "...",
    "nonce": "..."
  }
}
```

Response khi tắt:

```json
{
  "google": {
    "enabled": false
  }
}
```

Thêm route public:

```http
POST /api/v1/auth/google
Content-Type: application/json

{
  "credential": "<Google ID token>"
}
```

Response thành công giữ cùng contract với `POST /api/v1/auth/login`:

```json
{
  "token": "<CIS JWT>",
  "admin": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin"
  }
}
```

Các error code dự kiến:

- `GOOGLE_AUTH_DISABLED`.
- `GOOGLE_CREDENTIAL_REQUIRED`.
- `GOOGLE_TOKEN_INVALID`.
- `GOOGLE_NONCE_INVALID`.
- `GOOGLE_ACCOUNT_NOT_AUTHORIZED`.
- `GOOGLE_ACCOUNT_ALREADY_BOUND`.
- `GOOGLE_EMAIL_NOT_AUTHORITATIVE`.

Thông báo ra UI phải đủ hiểu nhưng không tiết lộ admin email nào đang tồn tại hoặc trạng thái chi tiết của account.

### 7.4 Admin Web proxy và cookie challenge

`apps/admin-web/server.js` cần chuyển tiếp có kiểm soát:

- Request header `Cookie` cho auth challenge.
- Response header `Set-Cookie` từ API về browser.
- Không chuyển tiếp tùy tiện toàn bộ provider/header nhạy cảm.

Cookie challenge:

- `HttpOnly`.
- `SameSite=Lax`.
- `Secure` ở production HTTPS.
- Thời hạn ngắn, cùng thời hạn nonce.
- Xóa sau lần verify thành công hoặc thất bại cuối cùng.

## 8. Frontend Admin UI

### 8.1 Giao diện

Trong login card hiện tại:

- Giữ nguyên email/password form.
- Thêm divider “hoặc”.
- Thêm vùng render nút Google full-width bên dưới divider.
- Nút phải do GIS render, không tự vẽ nút giả giống Google.
- Không hiển thị vùng Google nếu feature bị tắt.

### 8.2 Hành vi

`apps/admin-web/public/pages/auth.js` thực hiện:

- Gọi config endpoint khi page load.
- Tải `https://accounts.google.com/gsi/client` đúng một lần khi feature bật.
- Khởi tạo GIS bằng client ID, nonce, callback và FedCM setting phù hợp.
- Khi nhận credential, disable riêng vùng login đang chạy và hiển thị loading.
- Gửi credential sang CIS API.
- Khi thành công, lưu CIS JWT và redirect giống password flow.
- Khi lỗi, giữ nguyên dữ liệu password form, khôi phục nút và hiển thị lỗi trong vùng chung.
- Không log hoặc lưu Google credential vào local/session storage.
- Không dùng payload do browser decode để quyết định quyền admin.

Cần bao phủ đủ trạng thái:

- Đang tải config.
- Google login bị tắt.
- GIS script không tải được.
- Đang xác thực.
- Tài khoản không được phép.
- Challenge/token hết hạn và có thể thử lại.
- Thành công.

### 8.3 Content Security Policy

Cập nhật CSP trong `apps/admin-web/server.js` bằng allowlist tối thiểu cho Google Identity Services:

- `script-src` cho GIS client.
- `frame-src` cho GIS iframe.
- `connect-src` cho endpoint GIS cần thiết.
- `style-src` chỉ bổ sung Google GIS origin nếu runtime thực tế yêu cầu.

Không thêm wildcard và không nới `unsafe-inline` ngoài chính sách hiện tại. Danh sách origin cuối cùng phải đối chiếu tài liệu GIS và kiểm tra bằng browser trước khi merge.

## 9. Bảo mật và audit

- Backend là nơi duy nhất quyết định admin có được đăng nhập hay không.
- Kiểm tra `aud`, `iss`, `exp`, chữ ký và nonce trước khi đọc danh tính.
- Dùng `sub` làm khóa định danh lâu dài, không dùng email làm khóa sau khi đã liên kết.
- Không tự tạo admin và không tự enable admin.
- Không lưu Google ID token/access token/refresh token.
- Không đưa credential, raw token, Google payload hoặc email đầy đủ vào log/error details.
- Có thể log correlation ID, kết quả tổng quát và admin ID sau khi đã xác thực.
- Rate limit endpoint Google login cùng mức hoặc chặt hơn password login.
- Liên kết lần đầu phải atomic để hai request đồng thời không chiếm cùng account.
- Password login và logout hiện tại không đổi.

## 10. Kế hoạch kiểm thử

### 10.1 Unit và integration Auth

- Password login hiện tại vẫn pass.
- Config trả disabled khi feature flag tắt.
- Bật feature nhưng thiếu client ID bị config validation chặn.
- Config bật trả public client ID và nonce hợp lệ.
- Google token hợp lệ liên kết lần đầu với admin có email tương ứng.
- Lần đăng nhập sau tìm đúng admin bằng `sub`, kể cả khi email claim thay đổi.
- Thành công phát hành CIS JWT và gọi `/me` được.
- Token sai audience, issuer, signature hoặc hết hạn bị từ chối.
- Thiếu/sai/hết hạn nonce bị từ chối.
- Unknown admin và disabled admin bị từ chối bằng thông báo không dò được account.
- Email chưa verify bị từ chối.
- Email bên thứ ba không có `hd` không được tự bind.
- Một admin đã bind `sub` khác bị từ chối.
- Hai admin không thể bind cùng `sub`.
- Error/log không chứa raw credential.

Google client phải được inject/fake trong test; CI không gọi Google thật.

### 10.2 Migration/repository

- Fresh database chạy migration thành công.
- Database có admin cũ được migrate mà không mất dữ liệu.
- `google_subject` nullable cho account chưa liên kết.
- Unique partial index chặn trùng subject.
- `bindGoogleSubject` atomic và không ghi đè subject đã có.

### 10.3 Admin UI E2E

- Feature tắt: không có nút Google, password login hoạt động như cũ.
- Feature bật: login card hiển thị divider và vùng nút Google.
- Mock GIS callback + API success: CIS JWT được lưu và redirect đúng `next`.
- API failure: password input không mất, lỗi hiển thị rõ, có thể retry.
- Script GIS load failure: password login vẫn dùng được.
- Loading chỉ ảnh hưởng login action đang chạy.
- Tab order, keyboard focus, mobile width và error announcement hoạt động.
- Logout sau Google login xóa CIS session giống password login.

### 10.4 Manual acceptance

- Đăng nhập thật bằng Google account có email trùng admin hiện hữu.
- Đăng nhập lại dùng binding `sub` đã lưu.
- Google account không được cấp quyền bị từ chối.
- Password fallback vẫn hoạt động.
- Kiểm tra local origin và production HTTPS origin.
- Kiểm tra CSP không có lỗi chặn GIS ngoài các origin đã dự kiến.

Các lệnh verify dự kiến sau khi triển khai:

```powershell
npm run verify:phase01
npm run admin:ci
npm run verify:admin-ui-e2e
npm run verify:phase07
npm run verify:docs
npm test
```

Tên script cuối cùng sẽ bám theo scripts hiện hữu; không tạo script trùng chức năng chỉ để đổi tên.

## 11. Trình tự triển khai

1. Đọc lại architecture boundary/structure và interface docs trước khi sửa code.
2. Bổ sung dependency, env schema và config validation.
3. Thêm migration và repository methods.
4. Tạo Google identity gateway.
5. Tách shared CIS session issuer từ password login.
6. Viết `getGoogleLoginConfig` và `loginWithGoogle`.
7. Thêm controller/routes và proxy cookie/header handling.
8. Thêm unit/integration test backend.
9. Thêm UI login Google và CSP allowlist.
10. Thêm E2E với GIS/API mock.
11. Cập nhật tài liệu interface, security/quality và vận hành.
12. Chạy toàn bộ verify, sau đó mới bật feature ở local.
13. Manual smoke bằng Google account thật trước production rollout.

## 12. Rollout và rollback

### Rollout

1. Tạo Google OAuth Web Client và cấu hình consent branding.
2. Khai báo exact Authorized JavaScript Origins.
3. Deploy migration và code với `GOOGLE_OAUTH_ENABLED=false`.
4. Xác nhận admin cần dùng Google đã tồn tại và đang enabled.
5. Cấu hình `GOOGLE_OAUTH_CLIENT_ID` trên môi trường.
6. Bật feature flag và restart service.
7. Smoke test một account được cấp quyền và một account không được cấp quyền.
8. Giữ password login làm fallback.

### Rollback

- Đặt `GOOGLE_OAUTH_ENABLED=false` và restart service.
- UI ẩn Google login, endpoint từ chối Google login.
- Password login tiếp tục hoạt động.
- Không cần rollback migration ngay; `google_subject` nullable và không ảnh hưởng luồng cũ.

## 13. Estimate

| Hạng mục | Ước lượng |
| --- | ---: |
| Config, migration, repository, Google gateway | 0.75–1 ngày |
| Auth use case, API, nonce/cookie/proxy | 0.5 ngày |
| Admin UI, CSP và trạng thái lỗi/loading | 0.5 ngày |
| Automated test, docs và manual smoke | 0.5 ngày |
| **Tổng** | **2.25–2.5 ngày dev** |

Estimate không bao gồm thời gian chờ Google Console/consent verification nếu tổ chức yêu cầu quy trình duyệt bên ngoài.

## 14. Acceptance criteria

- [ ] Google login chỉ thành công với admin CIS đã tồn tại và đang enabled.
- [ ] Không tự tạo admin từ Google.
- [ ] Lần đầu bind theo email hợp lệ; các lần sau nhận diện bằng `sub`.
- [ ] CIS JWT sau Google login có cùng contract và quyền với password login.
- [ ] Không lưu hoặc log Google ID/access/refresh token.
- [ ] Feature flag tắt hoàn toàn Google UI và Google login endpoint.
- [ ] Password login, logout, `/me` và safe redirect không regression.
- [ ] CSP chỉ mở các Google GIS origin tối thiểu.
- [ ] Backend test, Admin UI E2E và manual acceptance đều pass.

## 15. Tài liệu tham chiếu chính thức

- [Google Identity Services overview](https://developers.google.com/identity/gsi/web/guides/overview)
- [Verify the Google ID token on the server](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token)
- [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect)
- [Render the Sign in with Google button](https://developers.google.com/identity/gsi/web/guides/display-button)
