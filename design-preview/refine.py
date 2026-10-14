from pathlib import Path
p=Path('script.js')
s=p.read_text(encoding='utf-8')
# Remove the retired smooth illustrations and old map icon catalog.
s=s[:s.index("function createGwanganBridgeIllustrationSvg(")]+s[s.index("const BUSAN_SCENES ="): ]
start=s.index("function createAtmosphereSvg()")
end=s.index("function createBusanMapIntroSvg(",start)
s=s[:start]+"""function createBusanMapLandmarkArtwork(sceneKey) {
    return LandmarkArt[sceneKey]?.map() || LandmarkArt.gwangan.map();
}

"""+s[end:]
start=s.index("    const artworkByScene = {",s.index("function createBusanSceneIllustrationSvg"))
end=s.index("    return ",start)
s=s[:start]+"""    const redesign = LandmarkArt[safeSceneKey];
    const sceneHeight = redesign.height;

"""+s[end:]
s=s.replace('${redesign?.viewBox || \'0 0 400 200\'}','${redesign.viewBox}')
s=s.replace('            <defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="var(--scene-sky-top)"/><stop offset="1" stop-color="var(--scene-sky-bottom)"/></linearGradient></defs>\n','')
s=s.replace('            <rect width="${redesign?.width || 400}" height="${sceneHeight}" fill="url(#${gradientId})"/>\n','')
s=s.replace('${redesign ? redesign.render() : createAtmosphereSvg() + artworkByScene[safeSceneKey]()}','${redesign.render()}')
s=s.replace('<rect class="map-landmark-badge" x="-58" y="-50" width="116" height="100" rx="20"/>','<path class="map-landmark-badge" d="M-50-50H50V-42H58V42H50V50H-50V42H-58V-42H-50Z"/>')
s=s.replace('<path class="map-landmark-shadow" d="M-88 61q88 18 176 0v16q-88 22-176 0Z"/>','<rect class="map-landmark-shadow" x="-88" y="61" width="176" height="8"/>')
start=s.index('<span class="hero-smile"')
end=s.index('</span>',start)+len('</span>')
s=s[:start]+'<span class="hero-smile" aria-hidden="true">${createPixelUiIcon(\'smile\')}</span>'+s[end:]
s=s.replace('${step.iconSvg}',"${createPixelUiIcon(index === 0 ? 'phone' : index === 1 ? 'chat' : 'gift')}")
# The action arrows share one crisp, tiny sprite.
import re
s=re.sub(r'<svg(?: class="btn-arrow")? viewBox="0 0 20 20" fill="currentColor"(?: aria-hidden="true")?>\s*<path fill-rule="evenodd".*?</svg>',"${createPixelUiIcon('arrow')}",s,flags=re.S)
# Shorten the deliberate intro waiting and zoom while keeping the preview mode.
s=s.replace('litePerformance ? 750 : balancedPerformance ? 1000 : 1200','litePerformance ? 250 : balancedPerformance ? 400 : 500')
s=s.replace('litePerformance ? 750 : balancedPerformance ? 950 : 1100','litePerformance ? 350 : balancedPerformance ? 500 : 600')
p.write_text(s,encoding='utf-8')

