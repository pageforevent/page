// DOM이 완전히 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    loadEventData();
});

// JSON 파일(CMS 역할)에서 데이터를 비동기로 불러오는 함수
async function loadEventData() {
    try {
        // 깃허브 페이지 등에서 캐시 문제를 방지하기 위해 타임스탬프 추가
        const response = await fetch(`data.json?t=${new Date().getTime()}`);
        if (!response.ok) {
            throw new Error('데이터를 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        renderPage(data);
    } catch (error) {
        console.error(error);
        document.getElementById('header-container').innerHTML = '<p>데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>';
    }
}

// 불러온 데이터를 바탕으로 화면을 그리는 함수 (모듈화)
function renderPage(data) {
    // 1. 문서 제목 설정
    document.title = data.pageTitle;

    // 2. 헤더 영역 렌더링
    const headerContainer = document.getElementById('header-container');
    headerContainer.innerHTML = `
        <h1>${data.headerTitle}</h1>
        <p>${data.headerDescription}</p>
    `;

    // 3. 버튼 영역 렌더링
    const stepContainer = document.getElementById('step-container');
    stepContainer.innerHTML = ''; // 기존 '로딩중' 텍스트 초기화

    data.steps.forEach(step => {
        const stepElement = document.createElement('div');
        stepElement.className = 'step-item';
        
        stepElement.innerHTML = `
            <div class="step-title">${step.title}</div>
            <a href="${step.link}" class="btn-go" target="${step.target}" rel="noopener noreferrer">${step.buttonText}</a>
        `;
        
        stepContainer.appendChild(stepElement);
    });
}
