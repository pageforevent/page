document.addEventListener('DOMContentLoaded', () => {
    loadEventData();
});

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
    // headerDescription이 삭제되었으므로 title만 렌더링
    headerContainer.innerHTML = `
        <h1>${data.headerTitle}</h1>
    `;

    const stepContainer = document.getElementById('step-container');
    stepContainer.innerHTML = '';

    data.steps.forEach((step, index) => {
        const stepElement = document.createElement('div');
        stepElement.className = 'step-item';
        
        // 순차적 등장 애니메이션 딜레이 설정
        stepElement.style.animationDelay = `${index * 0.2}s`;
        
        stepElement.innerHTML = `
            <div class="icon-wrapper">
                ${step.iconSvg}
            </div>
            <div class="step-title">${step.title}</div>
            <a href="${step.link}" class="btn-go" target="${step.target}" rel="noopener noreferrer">${step.buttonText}</a>
        `;
        
        stepContainer.appendChild(stepElement);
    });
}
