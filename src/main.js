import './style.css'

// Webinar Configuration - Single Source of Truth
const webinarConfig = {
    date: '5月19日（星期二）',
    time: '8:30 PM'
};

// Populate Webinar Date/Time
document.querySelectorAll('[data-webinar-date]').forEach(el => el.textContent = webinarConfig.date);
document.querySelectorAll('[data-webinar-time]').forEach(el => el.textContent = webinarConfig.time);
document.querySelectorAll('[data-webinar-datetime]').forEach(el => el.textContent = `${webinarConfig.date}，晚上 ${webinarConfig.time}`);

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
    webinarForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(webinarForm);
        
        const fullName = formData.get('full_name')?.trim() || '';
        const phone = formData.get('phone')?.trim() || '';
        const email = formData.get('email')?.trim() || '';

        if (!fullName || !phone) {
            alert("请填写所有必填字段，不能仅输入空格。(Please fill in all required fields.)");
            return;
        }

        formData.set('full_name', fullName);
        formData.set('phone', phone);
        formData.set('email', email);

        // Capture URL parameters (UTMs & fbclid) and send them to GoHighLevel CRM
        const urlParams = new URLSearchParams(window.location.search);
        for (const [key, value] of urlParams.entries()) {
            if (!formData.has(key)) {
                formData.append(key, value);
            }
        }

        const name = fullName;

        // Loading State
        const submitBtn = webinarForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '提交中... (Submitting...)';
        submitBtn.disabled = true;

        try {
            // TODO: Replace with your actual GHL Inbound Webhook URL
            await fetch('https://services.leadconnectorhq.com/hooks/oWBSHqDcUyZxZZSNR2l4/webhook-trigger/6bbcd9e7-87cb-489f-aab3-8e13f82aaa68', {
                method: 'POST',
                body: formData
            });

            // Fire Meta Pixel Event with Advanced Matching to improve ad attribution
            if (typeof fbq === 'function') {
                fbq('init', '1627776708278600', {
                    em: email.toLowerCase().trim(),
                    ph: phone.trim().replace(/\D/g, ''),
                    fn: fullName.split(' ')[0],
                    ln: fullName.split(' ').slice(1).join(' ') || undefined
                });
                fbq('track', 'Lead', {
                    content_name: 'Sciatica Recovery Webinar',
                    currency: 'MYR'
                });
            }

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
                        <strong>直播日期:</strong> ${webinarConfig.date}，晚上 ${webinarConfig.time} (GMT+8)
                    </div>
                </div>
            `;
        } catch (error) {
            console.error("Submission failed", error);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            alert("提交失败，请重试。(Submission failed, please try again.)");
        }
    });
}
