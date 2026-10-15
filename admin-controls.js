const AdminControls = (() => {
    const labels = {
        eventEnabled: '행사 운영', intro: '지도 인트로', gallery: '명소 갤러리',
        randomScene: '접속할 때 명소 랜덤 선택', animation: '애니메이션', weather: '날씨 표현',
        season: '계절 표현', autoCoupons: '카카오 쿠폰 자동 수집', autoWeather: '기상청 날씨 자동 수집'
    };
    const scenes = {gwangan:'광안대교', haeundae:'해운대', gamcheon:'감천문화마을', huinnyeoul:'흰여울문화마을',
        jagalchi:'자갈치시장', nurimaru:'누리마루', busanTower:'부산타워', cinemaCenter:'영화의전당', beomeosa:'범어사', ahopsan:'아홉산숲'};
    let coupons = [], dirty = false, baseline = '', previewData = null, couponFilter = 'all', dragState = null;
    const $ = id => document.getElementById(id);
    const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    function field(label, name, value, type = 'text') {
        return `<label class="form-group"><span class="form-label">${label}</span><input class="form-input" data-field="${name}" type="${type}" value="${escape(value)}"></label>`;
    }
    function markDirty() {
        dirty = true;
        updateSaveStatus('저장하지 않은 변경사항이 있습니다.', 'ready');
    }
    function snapshot() {
        return JSON.stringify([...$('editor-view').querySelectorAll('input,textarea,select')].map(el => [el.id || el.dataset.field, el.type === 'checkbox' ? el.checked : el.value]));
    }
    function clean() { dirty = false; baseline = snapshot(); }
    function hasChanges() { return dirty || (baseline && snapshot() !== baseline); }
    function renderCoupons(openId = null) {
        const existing = [...$('coupon-list').querySelectorAll('.coupon-editor[open]')].map(card => card.dataset.id);
        const active = openId || existing[0];
        $('coupon-count').textContent = `전체 ${coupons.length}개 · 진행 중 ${coupons.filter(offer => SiteConfig.status(offer) === '진행 중').length}개`;
        $('coupon-list').innerHTML = coupons.map((offer, index) => `
            <details class="coupon-editor" name="coupon-editors" data-index="${index}" data-id="${escape(offer.id)}" data-mode="${SiteConfig.couponMode(offer)}" ${offer.id === active ? 'open' : ''}>
                <summary class="coupon-summary"><button type="button" class="drag-handle" aria-label="쿠폰 순서 끌어서 변경" title="끌어서 순서 변경">⠿</button><span class="coupon-number">${String(index+1).padStart(2,'0')}</span><span class="coupon-summary-copy"><strong data-summary-title>${escape(offer.title || '새 쿠폰')}</strong><small><span data-mode-label>${SiteConfig.couponMode(offer) === 'auto' ? '자동 갱신' : '수동 관리'}</span> · <span data-summary-period>${escape(offer.validFrom || '시작일 없음')} ~ ${escape(offer.validUntil || '종료일 없음')}</span></small></span><span class="badge-tag" data-status>${SiteConfig.status(offer)}</span><span class="disclosure-arrow" aria-hidden="true">⌄</span></summary>
                <div class="coupon-body">
                    <label class="form-checkbox-row coupon-enabled"><input type="checkbox" data-field="enabled" ${offer.enabled !== false ? 'checked' : ''}>이 쿠폰 사용</label>
                    <div class="form-grid">
                        ${field('혜택 제목', 'title', offer.title)}
                        ${field('연결 주소', 'link', offer.link, 'url')}
                        <div class="form-grid two-cols">${field('노출 시작일', 'validFrom', offer.validFrom, 'date')}${field('노출 종료일', 'validUntil', offer.validUntil, 'date')}</div>
                        <p class="form-hint">한국 날짜 기준, 종료일 포함. 비워 둔 날짜는 제한하지 않습니다.</p>
                        <details class="coupon-options"><summary>설명·버튼 문구</summary><div class="form-grid">
                            <label class="form-group"><span class="form-label">설명</span><textarea class="form-textarea" data-field="description">${escape(offer.description)}</textarea></label>
                            ${field('버튼 문구', 'buttonText', offer.buttonText || '바로가기')}
                        </div></details>
                        <details class="coupon-options"><summary>자동 갱신 설정</summary><div class="form-grid">
                            <label class="form-group"><span class="form-label">수집 연결</span><select class="form-input" data-field="source">${[['manual','직접 작성'],['monthly','카카오 월별 쿠폰'],['sports','카카오 스포츠/아웃도어']].map(([value,label]) => `<option value="${value}" ${offer.source === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
                            <label class="form-checkbox-row"><input type="checkbox" data-field="manualOverride" ${offer.manualOverride || offer.source === 'manual' ? 'checked' : ''}>수동 수정 보호</label>
                            <p class="form-hint">내용을 수정하면 보호가 켜집니다. 자동 수집을 다시 적용하려면 보호를 해제하세요.</p>
                        </div></details>
                    </div>
                    <div class="coupon-editor-footer"><span>쿠폰 순서</span><div class="coupon-actions"><button type="button" data-action="up" ${index ? '' : 'disabled'} aria-label="쿠폰 위로">↑</button><button type="button" data-action="down" ${index < coupons.length - 1 ? '' : 'disabled'} aria-label="쿠폰 아래로">↓</button></div><button type="button" class="delete-coupon" data-action="delete">쿠폰 삭제</button></div>
                </div>
            </details>`).join('') || '<p class="guide-box">등록한 쿠폰이 없습니다. 쿠폰 추가를 눌러 시작하세요.</p>';
        applyCouponFilter();
    }
    function refreshSummary(card) {
        const offer = coupons[Number(card.dataset.index)];
        card.querySelector('[data-status]').textContent = SiteConfig.status(offer);
        card.querySelector('[data-summary-title]').textContent = offer.title || '새 쿠폰';
        card.querySelector('[data-summary-period]').textContent = `${offer.validFrom || '시작일 없음'} ~ ${offer.validUntil || '종료일 없음'}`;
        card.dataset.mode = SiteConfig.couponMode(offer);
        card.querySelector('[data-mode-label]').textContent = card.dataset.mode === 'auto' ? '자동 갱신' : '수동 관리';
        $('coupon-count').textContent = `전체 ${coupons.length}개 · 진행 중 ${coupons.filter(offer => SiteConfig.status(offer) === '진행 중').length}개`;
    }
    function applyCouponFilter() {
        const cards = [...$('coupon-list').querySelectorAll('.coupon-editor')];
        $('btn-add-coupon').textContent = couponFilter === 'auto' ? '+ 자동 쿠폰 연결' : '+ 수동 쿠폰 추가';
        cards.forEach(card => { card.hidden = couponFilter !== 'all' && card.dataset.mode !== couponFilter; });
        for (const button of document.querySelectorAll('[data-coupon-filter]')) {
            const mode = button.dataset.couponFilter;
            const count = mode === 'all' ? coupons.length : coupons.filter(offer => SiteConfig.couponMode(offer) === mode).length;
            button.textContent = `${{all:'전체',auto:'자동 갱신',manual:'수동 관리'}[mode]} ${count}`;
            button.setAttribute('aria-pressed', String(mode === couponFilter));
        }
        $('coupon-list').querySelector('.filter-empty')?.remove();
        if (cards.length && cards.every(card => card.hidden)) {
            const empty = document.createElement('p'); empty.className = 'guide-box filter-empty';
            empty.textContent = couponFilter === 'auto' ? '자동 갱신 쿠폰이 없습니다. 쿠폰의 자동 갱신 설정에서 수집을 연결하고 수동 수정 보호를 해제할 수 있습니다.' : '수동 관리 쿠폰이 없습니다. 쿠폰 추가로 직접 작성할 수 있습니다.';
            $('coupon-list').appendChild(empty);
        }
    }
    function initDragSort() {
        const list = $('coupon-list');
        const clear = () => { list.querySelectorAll('.drop-before,.drop-after,.is-dragging').forEach(card => card.classList.remove('drop-before','drop-after','is-dragging')); };
        list.addEventListener('click', event => { if (event.target.closest('.drag-handle')) { event.preventDefault(); event.stopPropagation(); } });
        list.addEventListener('pointerdown', event => {
            const handle = event.target.closest('.drag-handle');
            if (!handle || event.button !== 0) return;
            event.preventDefault();
            const card = handle.closest('.coupon-editor');
            dragState = {id:card.dataset.id, pointerId:event.pointerId, startY:event.clientY, moved:false};
            handle.setPointerCapture(event.pointerId);
        });
        list.addEventListener('pointermove', event => {
            if (!dragState || dragState.pointerId !== event.pointerId) return;
            if (Math.abs(event.clientY - dragState.startY) < 5 && !dragState.moved) return;
            dragState.moved = true;
            clear();
            const source = [...list.querySelectorAll('.coupon-editor')].find(card => card.dataset.id === dragState.id);
            source?.classList.add('is-dragging');
            const target = document.elementFromPoint(event.clientX,event.clientY)?.closest('.coupon-editor');
            dragState.targetId = null;
            if (target && !target.hidden && target.dataset.id !== dragState.id) {
                const bounds = target.getBoundingClientRect();
                dragState.targetId = target.dataset.id;
                dragState.after = event.clientY > bounds.top + bounds.height / 2;
                target.classList.add(dragState.after ? 'drop-after' : 'drop-before');
            }
            if (event.clientY > window.innerHeight - 110) window.scrollBy(0,12);
            else if (event.clientY < 100) window.scrollBy(0,-12);
        });
        list.addEventListener('pointerup', event => {
            if (!dragState || dragState.pointerId !== event.pointerId) return;
            const state = dragState; dragState = null; clear();
            if (!state.moved || !state.targetId) return;
            syncCoupons();
            const index = coupons.findIndex(offer => offer.id === state.id);
            const [offer] = coupons.splice(index,1);
            const target = coupons.findIndex(item => item.id === state.targetId);
            coupons.splice(target + (state.after ? 1 : 0),0,offer);
            renderCoupons(); markDirty();
            $('coupon-sort-status').textContent = `${offer.title || '쿠폰'} 순서를 변경했습니다. 저장하면 반영됩니다.`;
        });
        list.addEventListener('pointercancel', () => { dragState = null; clear(); });
        list.addEventListener('keydown', event => {
            const handle = event.target.closest('.drag-handle');
            if (!handle || !['ArrowUp','ArrowDown'].includes(event.key)) return;
            event.preventDefault(); syncCoupons();
            const index = Number(handle.closest('.coupon-editor').dataset.index);
            const other = index + (event.key === 'ArrowUp' ? -1 : 1);
            if (other < 0 || other >= coupons.length) return;
            const id = coupons[index].id;
            [coupons[index],coupons[other]] = [coupons[other],coupons[index]];
            renderCoupons(); markDirty();
            [...list.querySelectorAll('.coupon-editor')].find(card => card.dataset.id === id)?.querySelector('.drag-handle').focus();
            $('coupon-sort-status').textContent = '쿠폰 순서를 변경했습니다. 저장하면 반영됩니다.';
        });
    }
    function syncCoupons() {
        $('coupon-list').querySelectorAll('.coupon-editor').forEach(card => {
            const offer = coupons[Number(card.dataset.index)];
            card.querySelectorAll('[data-field]').forEach(input => { offer[input.dataset.field] = input.type === 'checkbox' ? input.checked : input.value.trim(); });
        });
    }
    function load(data) {
        const settings = SiteConfig.settings(data);
        for (const key of Object.keys(SiteConfig.defaults)) {
            const input = $(`setting-${key}`);
            if (input.type === 'checkbox') input.checked = settings[key] !== false;
            else input.value = settings[key];
        }
        for (const step of [...data.steps, data.giftStep].filter(Boolean)) {
            const input = $(`enable-${step.id}`);
            if (input) input.checked = step.enabled !== false;
        }
        const order = [...data.steps, data.giftStep].filter(Boolean).sort((a,b) => (a.order ?? ({step1:1,step2:2,step3:3}[a.id])) - (b.order ?? ({step1:1,step2:2,step3:3}[b.id])));
        $('card-order').value = order.map(step => step.id).join(',');
        coupons = structuredClone(SiteConfig.offers(data.giftStep));
        const banner = data.footerBanner || {};
        $('banner-enabled').checked = Boolean(banner.enabled);
        for (const key of ['image','link','alt']) $(`banner-${key}`).value = banner[key] || '';
        renderCoupons();
        clean();
    }
    function collect(data) {
        syncCoupons();
        data.settings = {...data.settings};
        for (const key of Object.keys(SiteConfig.defaults)) {
            const input = $(`setting-${key}`);
            data.settings[key] = input.type === 'checkbox' ? input.checked : input.value.trim();
        }
        const order = $('card-order').value.split(',');
        for (const step of [...data.steps, data.giftStep].filter(Boolean)) {
            step.enabled = $(`enable-${step.id}`)?.checked !== false;
            step.order = order.indexOf(step.id) + 1;
            for (const key of ['link', 'link_android', 'link_ios']) {
                if (step[key] && !SiteConfig.safeLink(step[key])) throw new Error('카드 연결 주소는 http 또는 https 주소로 입력해 주세요.');
            }
        }
        for (const offer of coupons) {
            const card = $('coupon-list').querySelector(`[data-index="${coupons.indexOf(offer)}"]`);
            if (!card.querySelector('[data-field="validFrom"]').checkValidity() || !card.querySelector('[data-field="validUntil"]').checkValidity()) throw new Error('쿠폰 날짜를 확인해 주세요.');
            if (offer.validFrom && offer.validUntil && offer.validFrom > offer.validUntil) throw new Error('쿠폰 종료일은 시작일 이후여야 합니다.');
            if (offer.link && !SiteConfig.safeLink(offer.link)) throw new Error('쿠폰 연결 주소는 http 또는 https 주소로 입력해 주세요.');
        }
        for (const source of ['monthly', 'sports']) {
            if (coupons.filter(offer => offer.source === source).length > 1) throw new Error('같은 자동 수집 연결은 쿠폰 하나에만 지정해 주세요.');
        }
        const banner = {enabled: $('banner-enabled').checked};
        for (const key of ['image','link','alt']) banner[key] = $(`banner-${key}`).value.trim();
        if (banner.image && !SiteConfig.imageSource(banner.image)) throw new Error('하단 이미지는 http/https 주소 또는 media/ 경로로 입력해 주세요.');
        if (banner.enabled && !banner.image) throw new Error('하단 이미지 주소를 입력해 주세요.');
        if (banner.link && !SiteConfig.safeLink(banner.link)) throw new Error('이미지 연결 링크는 http 또는 https 주소로 입력해 주세요.');
        data.footerBanner = banner;
        data.giftStep.offers = structuredClone(coupons);
        delete data.giftStep.primaryOffer; delete data.giftStep.secondaryOffer; delete data.giftStep.showSecondOffer;
        return data;
    }
    function preview() {
        try {
            previewData = collectFormData();
            $('preview-panel').hidden = false;
            $('preview-frame').src = 'index.html?adminPreview=1';
            $('preview-panel').scrollIntoView({behavior: 'smooth', block: 'start'});
        } catch (error) { showToast(error.message, 'error', 6000); }
    }
    function init() {
        const toggles = keys => keys.map(key => `<label class="form-checkbox-row setting-toggle"><input id="setting-${key}" type="checkbox" checked><span>${labels[key]}</span></label>`).join('');
        const input = (key,label) => `<label class="form-group"><span class="form-label">${label}</span><input id="setting-${key}" class="form-input"></label>`;
        const group = (title,body) => `<details class="card-box editor-disclosure"><summary class="section-summary">${title}</summary><div class="form-grid">${body}</div></details>`;
        $('display-controls').innerHTML =
            group('행사 운영', toggles(['eventEnabled']) + input('closedMessage','행사 중지 안내') + '<p class="form-hint">운영을 끄면 방문자에게 중지 안내만 표시합니다.</p>') +
            group('명소 갤러리', toggles(['gallery','randomScene']) + `<label class="form-group"><span class="form-label">기본 명소</span><select id="setting-scene" class="form-input">${Object.entries(scenes).map(([key,label]) => `<option value="${key}">${label}</option>`).join('')}</select></label><p class="form-hint">랜덤 선택을 끄면 기본 명소로 고정합니다.</p>`) +
            group('화면 효과', toggles(['intro','animation','weather','season']));
        $('copy-controls').innerHTML = input('heroTitle','상단 영문 제목') + input('overline','페이지 제목 위 문구') + input('emptyMessage','진행 중인 쿠폰이 없을 때 안내');
        $('sync-controls').innerHTML = toggles(['autoCoupons','autoWeather']) + '<p class="form-hint">예약 갱신: 매일 서울 시간 09:30·10:00·10:30·11:00. 지연되어 11:00분이 지난 예약 수집은 건너뜁니다. 수동 요청은 시간 제한 없이 예약 수집 스위치와 관계없이 실행되며 수동 관리 쿠폰은 보호합니다.</p>';
        $('banner-controls').innerHTML = `<label class="form-checkbox-row"><input id="banner-enabled" type="checkbox">하단 이미지 섹션 사용</label>${['image','link','alt'].map((key,i) => `<label class="form-group"><span class="form-label">${['이미지 주소 (https://… 또는 media/…)','클릭 시 연결할 링크 (선택)','이미지 설명'][i]}</span><input id="banner-${key}" class="form-input"></label>`).join('')}<p class="form-hint">안내 카드 아래에 표시됩니다. 링크를 비워 두면 이미지만 표시합니다. 섹션을 꺼도 입력 내용은 유지됩니다.</p>`;
        $('card-controls').innerHTML = ['앱 설치','카카오 채널','사은 행사'].map((label,index) => `<label class="form-checkbox-row"><input id="enable-step${index+1}" type="checkbox" checked>${label} 카드 사용</label>`).join('') +
            `<label class="form-group"><span class="form-label">카드 표시 순서</span><select id="card-order" class="form-input">${[['step1,step2,step3','앱 → 채널 → 사은'],['step1,step3,step2','앱 → 사은 → 채널'],['step2,step1,step3','채널 → 앱 → 사은'],['step2,step3,step1','채널 → 사은 → 앱'],['step3,step1,step2','사은 → 앱 → 채널'],['step3,step2,step1','사은 → 채널 → 앱']].map(([value,label]) => `<option value="${value}">${label}</option>`).join('')}</select></label>`;
        $('editor-view').addEventListener('input', markDirty);
        $('editor-view').addEventListener('change', markDirty);
        $('coupon-list').addEventListener('input', event => {
            const card = event.target.closest('.coupon-editor');
            if (!card) return;
            if (!['enabled','manualOverride'].includes(event.target.dataset.field)) card.querySelector('[data-field="manualOverride"]').checked = true;
            syncCoupons();
            refreshSummary(card);
        });
        $('coupon-list').addEventListener('change', event => {
            const card = event.target.closest('.coupon-editor');
            if (card) { syncCoupons(); refreshSummary(card); }
        });
        $('coupon-list').addEventListener('click', event => {
            const button = event.target.closest('[data-action]');
            if (!button) return;
            syncCoupons(); const index = Number(button.closest('.coupon-editor').dataset.index);
            if (button.dataset.action === 'delete') {
                if (!confirm('이 쿠폰을 삭제할까요? 저장하기 전에는 되돌릴 수 있습니다.')) return;
                coupons.splice(index,1);
            } else {
                const other = index + (button.dataset.action === 'up' ? -1 : 1);
                [coupons[index],coupons[other]] = [coupons[other],coupons[index]];
            }
            renderCoupons(); markDirty();
        });
        $('btn-add-coupon').addEventListener('click', () => {
            syncCoupons();
            const automatic = couponFilter === 'auto';
            const source = automatic ? ['monthly','sports'].find(source => !coupons.some(offer => offer.source === source)) : 'manual';
            if (!source) {
                $('refresh-request-status').textContent = '월별·스포츠 쿠폰은 이미 연결되어 있습니다. 기존 쿠폰을 편집하거나 수동 관리에서 수정 보호를 해제해 주세요.';
                return;
            }
            couponFilter = automatic ? 'auto' : 'manual';
            coupons.push({id: crypto.randomUUID(), source, enabled:true, manualOverride:!automatic, title:'', link:'', buttonText:'바로가기'});
            renderCoupons(coupons[coupons.length-1].id); markDirty();
            $('coupon-list').lastElementChild.querySelector('input[data-field="title"]').focus();
        });
        document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => {
            document.querySelectorAll('[data-tab]').forEach(tab => { tab.setAttribute('aria-pressed', String(tab === button)); });
            document.querySelectorAll('[data-panel]').forEach(panel => { panel.hidden = panel.dataset.panel !== button.dataset.tab; });
        }));
        window.setInterval(() => {
            $('coupon-list').querySelectorAll('.coupon-editor').forEach(card => {
                refreshSummary(card);
            });
        }, 60 * 1000);
        $('btn-refresh-now').addEventListener('click', requestAutomaticRefresh);
        $('btn-reload-content').addEventListener('click', () => {
            if (hasChanges()) { $('refresh-request-status').textContent = '수정 중인 내용이 있습니다. 먼저 저장하거나 초안을 내려받아 주세요.'; return; }
            loadAndRenderContent();
        });
        document.querySelectorAll('[data-coupon-filter]').forEach(button => button.addEventListener('click', () => {
            syncCoupons(); couponFilter = button.dataset.couponFilter; applyCouponFilter();
        }));
        initDragSort();
        $('btn-preview').addEventListener('click', preview);
        $('preview-frame').addEventListener('load', () => {
            if (previewData) $('preview-frame').contentWindow.postMessage({type:'event-guide-preview', data:previewData}, window.location.origin);
        });
        $('btn-close-preview').addEventListener('click', () => { $('preview-panel').hidden = true; $('preview-frame').src = 'about:blank'; previewData = null; });
        $('btn-download-draft').addEventListener('click', () => {
            try {
                const url = URL.createObjectURL(new Blob([JSON.stringify(collectFormData(),null,2)], {type:'application/json'}));
                const link = document.createElement('a'); link.href = url; link.download = 'event-guide-draft.json'; link.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            } catch (error) { showToast(error.message, 'error'); }
        });
        window.addEventListener('beforeunload', event => { if (hasChanges()) { event.preventDefault(); event.returnValue = ''; } });
    }
    return {init, load, collect, clean, hasChanges};
})();
