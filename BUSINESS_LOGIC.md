# AdsMaster AI - Tài Liệu Chức Năng & Nghiệp Vụ

Tài liệu này mô tả chi tiết các phân hệ (modules), luồng nghiệp vụ (business logic) và các tính năng chính của nền tảng AdsMaster AI SaaS.

---

## 1. Hệ Thống Tài Khoản & Phân Quyền (Auth & RBAC)
Hệ thống sử dụng JWT (JSON Web Tokens) với chiến lược Access Token (ngắn hạn) và Refresh Token (dài hạn) để bảo mật.

**Tính năng chính:**
- **Đăng ký/Đăng nhập:** Hỗ trợ đăng ký bằng email và mật khẩu. Mật khẩu được mã hóa bằng `bcrypt`.
- **Quản lý phiên đăng nhập:** Khi token hết hạn, frontend tự động gọi API `/api/auth/refresh` để lấy token mới mà không bắt người dùng đăng nhập lại.
- **Phân quyền (Role-based Access Control):**
  - `USER`: Quyền cơ bản, truy cập các tính năng theo giới hạn của Gói cước (Plan).
  - `ADMIN`: Quyền quản trị tối cao, có thể xem thống kê toàn hệ thống, quản lý người dùng và thay đổi cấu hình.

---

## 2. Quản Lý Chiến Dịch Quảng Cáo (Campaigns)
Phân hệ cốt lõi giúp người dùng cấu trúc và theo dõi các chiến dịch mô phỏng hoặc thực tế.

**Luồng nghiệp vụ:**
- Người dùng tạo một Chiến dịch (Campaign) với các thông tin: Tên, Mục tiêu (AWARENESS, TRAFFIC, SALES, v.v.), Ngân sách tổng (Total Budget) và Ngân sách hằng ngày.
- Quản lý trạng thái chiến dịch: Hệ thống hỗ trợ các trạng thái `DRAFT` (Bản nháp), `ACTIVE` (Đang chạy), `PAUSED` (Tạm dừng), và `ARCHIVED` (Lưu trữ).
- *Tương lai:* Liên kết với Facebook Graph API để đồng bộ dữ liệu chiến dịch thực từ Facebook Ads Manager.

---

## 3. Trợ Lý AI Viết Nội Dung (AI Generator)
Sử dụng sức mạnh của OpenAI (GPT-4) để tự động hóa việc viết copy quảng cáo.

**Cách thức hoạt động:**
1. Người dùng cung cấp input đầu vào: Tên sản phẩm, Chân dung khách hàng mục tiêu, Lợi ích sản phẩm, Tone giọng (Chuyên nghiệp, hài hước, cấp bách...), và Định dạng quảng cáo.
2. Hệ thống gọi API nội bộ tới `ai-engine` (chạy bằng Python FastAPI).
3. AI sẽ phân tích và trả về một bộ nội dung hoàn chỉnh gồm:
   - Primary Text (Đoạn văn chính)
   - Headline (Tiêu đề in đậm)
   - Description (Mô tả ngắn hiển thị dưới link)
   - Call to Action (Nút kêu gọi hành động)
   - Ad Variants: Các biến thể để chạy A/B Testing.
   - Targeting Tips: Lời khuyên về target từ khóa, nhân khẩu học.

---

## 4. Phân Tích Dữ Liệu & Gợi Ý Tối Ưu (Analytics)
Hệ thống sử dụng thư viện `Pandas/NumPy` trên backend Python để phân tích các chỉ số quảng cáo và đưa ra cảnh báo.

**Các chỉ số (KPIs) được theo dõi:**
- **CTR (Click-Through Rate):** Tỷ lệ nhấp chuột.
- **CPA (Cost Per Acquisition):** Chi phí để có 1 chuyển đổi/đơn hàng.
- **ROAS (Return on Ad Spend):** Tỷ lệ lợi nhuận trên chi phí quảng cáo.
- **Impressions, Clicks, Spend, Conversions:** Các thông số cơ bản.

**Cơ chế AI Insights (AI báo lỗi):**
- Phát hiện bất thường: Ví dụ nếu CPA vọt lên quá cao so với trung bình, tỷ lệ CTR quá thấp dưới 1%.
- Hệ thống đưa ra các gợi ý xếp theo độ nghiêm trọng: `HIGH` (Cần sửa ngay), `MEDIUM` (Cần theo dõi), `LOW` (Mẹo tối ưu).

---

## 5. Hệ Thống Học Tập & Khóa Học (Courses)
Nơi cung cấp các kiến thức về Digital Marketing và Facebook Ads.

**Nghiệp vụ:**
- Người dùng có thể duyệt danh sách các khóa học được quản trị viên (Admin) đẩy lên.
- Mỗi khóa học chia thành các Modules và Lessons (Bài học).
- Có hệ thống theo dõi tiến độ (Progress tracking): Đánh dấu bài học đã hoàn thành. Khóa học có thể miễn phí hoặc yêu cầu gói Pro.

---

## 6. Quản Lý Khách Hàng Tiềm Năng (CRM)
Một mini-CRM tích hợp sẵn để người dùng lưu trữ data thu về từ quảng cáo Lead Generation.

**Nghiệp vụ:**
- Thu thập leads: Có thể nhập manual (thủ công) hoặc sau này hook từ form Facebook.
- Phân loại trạng thái (Pipeline): `NEW`, `CONTACTED`, `QUALIFIED`, `CONVERTED`, `LOST`.
- Lưu giữ lịch sử tương tác (Interaction History): Mỗi khi gọi điện hoặc gửi email cho Lead, nhân viên có thể ghi chú lại vào hệ thống.

---

## 7. Tiếp Thị Liên Kết (Affiliates)
Cơ chế giúp AdsMaster AI tự mở rộng user base thông qua Referral (Giới thiệu).

**Nghiệp vụ:**
- Mỗi người dùng có một Affiliate Code và Referral Link duy nhất.
- Khi một người mới đăng ký thông qua link này, hệ thống sẽ ghi nhận người giới thiệu.
- Khi người được giới thiệu nạp tiền mua các Gói (Plans), người giới thiệu sẽ nhận được hoa hồng (Commission Rate) - mặc định setup trong hệ thống là 30%.
- Thống kê lượt clicks, lượt đăng ký mới (Sign-ups), và doanh thu chờ rút.

---

## 8. Gói Cước & Thanh Toán (Billing & Subscriptions)
Tích hợp cổng thanh toán Stripe để tính phí thuê bao SaaS (SaaS Billing).

**Nghiệp vụ các gói (Plans):**
- **Free Plan ($0):** Giới hạn 3 chiến dịch, 10 lần dùng AI/tháng.
- **Pro Plan ($19):** Giới hạn 20 chiến dịch, 100 lần dùng AI, mở khóa tính năng AI Recommendations.
- **Agency Plan ($49):** Không giới hạn chiến dịch, 500 lần dùng AI/tháng và mở khóa toàn quyền quản lý khách hàng (CRM).

**Luồng thanh toán:**
1. Người dùng chọn gói -> Server tạo Stripe Checkout Session.
2. Frontend redirect người dùng sang trang thẻ tín dụng của Stripe.
3. Nếu thành công, Stripe gửi Webhook sự kiện `checkout.session.completed` về Backend.
4. Backend xử lý Webhook và cập nhật trạng thái `planId` của người dùng thành công. Tự động gia hạn hàng tháng (Recurring payment).

---

## 9. Quản Trị Hệ Thống (Admin Dashboard)
Chỉ hiển thị cho các tài khoản có role `ADMIN`.

**Tính năng chính:**
- Thống kê tổng số Users, Tổng doanh thu (MRR), Danh sách giao dịch gần nhất.
- Quản lý người dùng: Xem, khóa, hoặc nâng cấp tự do gói cước cho bất kỳ ai.
- Quản lý cấu hình toàn cầu và xem nhật ký hoạt động của hệ thống.
