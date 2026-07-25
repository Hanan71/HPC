/**
 * 🌟 المحرك البرمجي الموحد لصفحة انطلاقة HPC (خالٍ من الأخطاء والتعارضات)
 */
document.addEventListener("DOMContentLoaded", function () {
    
    const container = document.getElementById('bubbles-container');

    // 🏆 قائمة الأبطال المتصدرين لشحن الطاقة (محملة من data/leaderboard.json)
    let topChargers = [];

    // بيانات احتياطية تُستخدم إذا فشل تحميل الملف
    const FALLBACK_CHARGERS = [
        { name: 'بطل الطاقة', energy: '⚡ ---', img: 'img/logo1.png' },
        { name: 'بطل الطاقة', energy: '⚡ ---', img: 'img/logo1.png' },
        { name: 'بطل الطاقة', energy: '⚡ ---', img: 'img/logo1.png' },
    ];

    // دالة إنشاء وتطيير الفقاعات الصغيرة مع تمييز وتكبير المراكز الثلاثة الأولى
    function createBubble(user, userIndex) {
        if (!container) return;

        const bubble = document.createElement('div');
        bubble.classList.add('floating-bubble');

        let badgeHTML = '';
        let rankClass = '';
        let size = 0;

        // تحديد الشارة، كلاس التميز، والمقاس الأكبر للمراكز الثلاثة الأولى
        if (userIndex === 0) {
            rankClass = 'first-place';
            badgeHTML = `<span class="rank-badge gold-badge">${typeof window.t === 'function' ? window.t('rank_first') : '🥇 الأول'}</span>`;
            size = Math.floor(Math.random() * 10) + 120; // حجم مميز كبير جداً (120px - 130px)
        } else if (userIndex === 1) {
            rankClass = 'second-place';
            badgeHTML = `<span class="rank-badge silver-badge">${typeof window.t === 'function' ? window.t('rank_second') : '🥈 الثاني'}</span>`;
            size = Math.floor(Math.random() * 10) + 110; // حجم مميز كبير (110px - 120px)
        } else if (userIndex === 2) {
            rankClass = 'third-place';
            badgeHTML = `<span class="rank-badge bronze-badge">${typeof window.t === 'function' ? window.t('rank_third') : '🥉 الثالث'}</span>`;
            size = Math.floor(Math.random() * 10) + 100; // حجم مميز متوسط-كبير (100px - 110px)
        } else {
            size = Math.floor(Math.random() * 15) + 75; // الحجم الطبيعي لباقي الفقاعات العادية (75px - 90px)
        }

        if (rankClass) {
            bubble.classList.add(rankClass);
        }

        bubble.innerHTML = `
            ${badgeHTML}
            <img src="${user.img}" class="bubble-avatar" alt="${user.name}">
            <div class="bubble-info">
                ${user.name}
                <span class="bubble-energy">${user.energy}</span>
            </div>
        `;

        const leftPosition = Math.random() * 90; 
        const animationDuration = Math.random() * 6 + 9; 
        const swayDuration = Math.random() * 2 + 3; 
        const delay = Math.random() * 3; 

        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${leftPosition}%`;
        bubble.style.animationDuration = `${animationDuration}s, ${swayDuration}s`;
        bubble.style.animationDelay = `${delay}s`;

        container.appendChild(bubble);

        setTimeout(() => {
            bubble.remove();
        }, (animationDuration + delay) * 1000);
    }

    let index = 0;
    function spawnLoop() {
        if (topChargers.length > 0) {
            // نمرر الـ index الحالي للدالة لكي تتعرف على الترتيب
            createBubble(topChargers[index], index);
            index = (index + 1) % topChargers.length;
        }
        setTimeout(spawnLoop, 2500);
    }

    // 🌟 تحميل بيانات المتصدرين من data/leaderboard.json ثم تشغيل حلقة الفقاعات 🌟
    if (container) {
        fetch('data/leaderboard.json')
            .then(function(response) { return response.json(); })
            .then(function(data) {
                // leaderboard.json has { heroes: [...], supporters: [...] }
                // Fall back gracefully if an old flat-array format is served
                topChargers = Array.isArray(data) ? data : (data.heroes || []);
                spawnLoop();
            })
            .catch(function(err) {
                console.error('فشل تحميل بيانات المتصدرين:', err);
                // استخدام البيانات الاحتياطية حتى لا تظهر الصفحة فارغة
                topChargers = FALLBACK_CHARGERS;
                spawnLoop();
                // إظهار بانر الخطأ للمستخدم
                var banner = document.getElementById('leaderboard-error-banner');
                if (banner) {
                    banner.style.display = 'flex';
                    // إخفاء تلقائي بعد 8 ثوانٍ
                    setTimeout(function() {
                        banner.style.transition = 'opacity 0.5s ease';
                        banner.style.opacity = '0';
                        setTimeout(function() { banner.style.display = 'none'; banner.style.opacity = ''; banner.style.transition = ''; }, 500);
                    }, 8000);
                }
            });
    }

    // حركة الخلفية الكبيرة الكاروسيل
    const bgCarouselItems = document.querySelectorAll('#bg-carousel .carousel-item');
    if (bgCarouselItems.length > 1) {
        let bgIndex = 0;
        setInterval(() => {
            bgCarouselItems[bgIndex].classList.remove('active');
            bgIndex = (bgIndex + 1) % bgCarouselItems.length;
            bgCarouselItems[bgIndex].classList.add('active');
        }, 2000);
    }

    // حركة الصور داخل الدوائر
    const circleCarousels = document.querySelectorAll('.circle-bg-carousel');
    circleCarousels.forEach(carousel => {
        const circleImages = carousel.querySelectorAll('img');
        if (circleImages.length > 1) {
            let circleIndex = 0;
            setInterval(() => {
                circleImages[circleIndex].classList.remove('active');
                circleIndex = (circleIndex + 1) % circleImages.length;
                circleImages[circleIndex].classList.add('active');
            }, 3000);
        }
    });
});

// دالة الانتقال والتأثيرات عند النقر (يجب أن تكون خارج DOMContentLoaded لتتمكن أزرار الـ HTML من قراءتها)
function navigateToPage(pageUrl, element) {
    if (!element) return;

    const container = document.getElementById('mainContainer');
    const allCircles = document.querySelectorAll('.interactive-circle');
    const mainTitle = document.querySelector('.main-title');
    const shareBtn = document.querySelector('.share-success-btn');

    if (element.classList.contains('interactive-circle')) {
        element.classList.add('pop-effect');
    }

    if (container) {
        container.classList.add('spinning-effect');
    }

    if(mainTitle) mainTitle.classList.add('fade-out-element');
    if(shareBtn) shareBtn.classList.add('fade-out-element');

    allCircles.forEach(circle => {
        if (circle !== element) {
            circle.classList.add('fade-out-element');
        }
    });

    setTimeout(() => {
        if (element.classList.contains('interactive-circle')) {
            element.classList.add('selected-grow');
        } else {
            element.classList.add('fade-out-element');
        }
    }, 400);

    setTimeout(() => {
        window.location.href = pageUrl;
    }, 900);
}

// إعادة تصفير الحركات عند العودة للخلف (Back)
window.addEventListener('pageshow', function (event) {
    if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
        const container = document.getElementById('mainContainer');
        const allCircles = document.querySelectorAll('.interactive-circle');
        const mainTitle = document.querySelector('.main-title');
        const shareBtn = document.querySelector('.share-success-btn');

        if (container) container.classList.remove('spinning-effect');
        if (mainTitle) mainTitle.classList.remove('fade-out-element');
        if (shareBtn) shareBtn.classList.remove('fade-out-element');

        allCircles.forEach(circle => {
            circle.classList.remove('fade-out-element');
            circle.classList.remove('selected-grow');
            circle.classList.remove('pop-effect');
        });
    }
});