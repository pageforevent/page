document.addEventListener('DOMContentLoaded', () => {
    loadEventData();
});

// 사용자의 모바일 OS를 판별하는 함수
function getMobileOS() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent)) {
        return 'android';
    }
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return 'ios';
    }
    return 'unknown';
}

async function loadEventData() {
    try {
        const response = await fetch(`data.json?t=${new Date().getTime()}`);
        if (!response.ok) {
            throw new Error('데이터를 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        renderPage(data);
    } catch (error) {
        console.error(error);
        document.getElementById('header-container').innerHTML = '<p>오류가 발생했습니다.</p>';
    }
}

function renderPage(data) {
    document.title = data.pageTitle;

    const headerContainer = document.getElementById('header-container');
    headerContainer.innerHTML = `
        <h1>${data.headerTitle}</h1>
    `;

    const stepContainer = document.getElementById('step-container');
    stepContainer.innerHTML = '';
    
    const userOS = getMobileOS();

    data.steps.forEach((step, index) => {
        const stepElement = document.createElement('div');
        stepElement.className = 'step-item';
        stepElement.style.animationDelay = `${index * 0.2}s`;
        
        // 1번 어플 설치 단계일 경우 OS에 따라 링크 분기
        let finalLink = step.link;
        if (step.id === 'step1') {
            if (userOS === 'ios' && step.link_ios) {
                finalLink = step.link_ios;
            } else if (userOS === 'android' && step.link_android) {
                finalLink = step.link_android;
            } else {
                // OS 판별 불가 시 기본(안드로이드) 링크 혹은 통합 링크 사용
                finalLink = step.link_android || step.link;
            }
        }
        
        stepElement.innerHTML = `
            <div class="icon-wrapper">
                ${step.iconSvg}
            </div>
            <div class="step-title">${step.title}</div>
            <a href="${finalLink}" class="btn-go" target="${step.target}" rel="noopener noreferrer">${step.buttonText}</a>
        `;
        
        stepContainer.appendChild(stepElement);
    });
}
