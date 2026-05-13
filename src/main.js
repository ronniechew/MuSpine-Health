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

function isValidFullName(value) {
    const trimmedValue = value.trim();
    const lettersOnly = trimmedValue.replace(/[^\p{L}\p{M}\s'-]/gu, '').replace(/[\s'-]/g, '');

    return lettersOnly.length >= 2;
}

function isValidPhoneNumber(value) {
    const digitsOnly = value.replace(/\D/g, '');

    return digitsOnly.length >= 8;
}

// Form Submission
const webinarForm = document.getElementById('webinar-form');
if (webinarForm) {
    webinarForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(webinarForm);
        
        const fullName = formData.get('full_name')?.trim() || '';
        const phone = formData.get('phone')?.trim() || '';
        const email = formData.get('email')?.trim() || '';

        if (!isValidFullName(fullName)) {
            alert("请输入有效姓名，至少包含2个文字字符。(Please enter a valid name with at least 2 letters.)");
            return;
        }

        if (!isValidPhoneNumber(phone)) {
            alert("请输入有效电话号码，至少包含8个数字。(Please enter a valid phone number with at least 8 digits.)");
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

        // Explicitly map campaign/adset/ad IDs if they are passed via standard UTM parameters
        // This makes it easier to track in GHL without manual mapping
        const campaignId = urlParams.get('campaign_id') || urlParams.get('utm_campaign') || urlParams.get('utm_id');
        const adSetId = urlParams.get('adset_id') || urlParams.get('utm_term');
        const adId = urlParams.get('ad_id') || urlParams.get('utm_content');

        if (campaignId && !formData.has('campaign_id')) formData.append('campaign_id', campaignId);
        if (adSetId && !formData.has('adset_id')) formData.append('adset_id', adSetId);
        if (adId && !formData.has('ad_id')) formData.append('ad_id', adId);

        // Capture Additional Useful Metadata for Attribution
        const advancedMetadata = {
            page_url: window.location.href,
            referrer: document.referrer || 'Direct',
            user_agent: navigator.userAgent,
            browser_language: navigator.language,
            device_resolution: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timestamp: new Date().toISOString()
        };

        for (const [key, value] of Object.entries(advancedMetadata)) {
            if (!formData.has(key)) {
                formData.append(key, value);
            }
        }

        // Extract Meta cookies (_fbp, _fbc) for better CAPI matching
        document.cookie.split(';').forEach(cookie => {
            const [name, val] = cookie.trim().split('=');
            if (name === '_fbp' && !formData.has('fbp')) formData.append('fbp', val);
            if (name === '_fbc' && !formData.has('fbc')) formData.append('fbc', val);
        });

        // Generate a unique Event ID for Meta deduplication (Client + Server CAPI)
        const eventId = 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        formData.append('event_id', eventId);

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
            // if (typeof fbq === 'function') {
            //     fbq('init', '1627776708278600', {
            //         em: email.toLowerCase().trim(),
            //         ph: phone.trim().replace(/\D/g, ''),
            //         fn: fullName.split(' ')[0],
            //         ln: fullName.split(' ').slice(1).join(' ') || undefined
            //     });
            //     fbq('track', 'Lead', {
            //         content_name: 'Sciatica Recovery Webinar',
            //         currency: 'MYR'
            //     }, { eventID: eventId }); // Pass eventID for deduplication
            // }

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
