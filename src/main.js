import './style.css'

// Sticky Bar Logic
const stickyBar = document.getElementById('sticky-bar');
const heroForm = document.getElementById('register');

const observerOptions = {
    root: null,
    threshold: 0,
    rootMargin: '-100px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            stickyBar.classList.add('visible');
        } else {
            stickyBar.classList.remove('visible');
        }
    });
}, observerOptions);

if (heroForm) {
    observer.observe(heroForm);
}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Form Submission
const webinarForm = document.getElementById('webinar-form');
if (webinarForm) {
    webinarForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(webinarForm);
        const name = formData.get('name');

        // Premium Success Message
        const formContainer = webinarForm.parentElement;
        formContainer.innerHTML = `
            <div class="text-center animate" style="padding: 40px 0;">
                <div style="width: 80px; height: 80px; background: var(--accent); color: var(--secondary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h3 style="margin-bottom: 12px;">报名成功！</h3>
                <p style="color: var(--text-medium); margin-bottom: 24px;">感谢您，${name}。确认链接已发送至您的 WhatsApp 或电子邮箱。</p>
                <div style="background: var(--bg-light); padding: 15px; border-radius: 8px; font-size: 0.9rem; border: 1px dashed var(--border);">
                    <strong>讲座主题:</strong> 无需手术缓解坐骨神经痛之医疗方案分享<br>
                    <strong>直播日期:</strong> 本周日，晚上 8:00 PM (GMT+8)
                </div>
            </div>
        `;
    });
}
