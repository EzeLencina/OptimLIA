let currentStep = 1;

document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    loadFromStorage();
    updateTitlePreview();
    updateScore();
});

function initEventListeners() {
    document.querySelectorAll('.step-item').forEach(item => {
        item.addEventListener('click', () => {
            const step = parseInt(item.dataset.step);
            goToPanel(step);
        });
    });

    const titleInputs = ['productName', 'productBrand', 'productModel', 'productAttribute', 'productUsage'];
    titleInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                updateTitlePreview();
                updateScore();
            });
        }
    });

    const nameInput = document.getElementById('productName');
    if (nameInput) {
        nameInput.addEventListener('input', () => {
            document.getElementById('nameCount').textContent = nameInput.value.length;
            const counter = nameInput.parentElement.querySelector('.char-counter');
            if (nameInput.value.length > 55) {
                counter.classList.add('error');
                counter.classList.remove('warning');
            } else if (nameInput.value.length > 45) {
                counter.classList.add('warning');
                counter.classList.remove('error');
            } else {
                counter.classList.remove('warning', 'error');
            }
        });
    }

    const introInput = document.getElementById('descIntro');
    if (introInput) {
        introInput.addEventListener('input', () => {
            document.getElementById('introCount').textContent = introInput.value.length;
        });
    }

    document.querySelectorAll('#specsForm input').forEach(input => {
        input.addEventListener('input', () => {
            updateSpecsProgress();
            updateScore();
        });
    });

    document.querySelectorAll('#kwPrimary, #kwSecondary1, #kwSecondary2, #kwSecondary3, #kwLongtail1, #kwLongtail2').forEach(input => {
        if (input) input.addEventListener('input', () => {
            updateKeywordAnalysis();
            updateScore();
        });
    });
}

function goToPanel(step) {
    document.querySelectorAll('.step-panel').forEach(p => {
        p.classList.remove('active');
        if (p.id === 'panelResult') p.style.display = 'none';
    });
    document.getElementById('panel' + step).classList.add('active');

    document.querySelectorAll('.step-item').forEach(item => {
        const s = parseInt(item.dataset.step);
        item.classList.remove('active');
        if (s === currentStep && s < step) {
            item.classList.add('completed');
        }
    });

    document.querySelector(`.step-item[data-step="${step}"]`).classList.add('active');

    for (let i = 1; i < step; i++) {
        document.querySelector(`.step-item[data-step="${i}"]`).classList.add('completed');
    }

    currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextStep(step) {
    goToPanel(step);
}

function prevStep(step) {
    goToPanel(step);
}

function updateTitlePreview() {
    const product = document.getElementById('productName').value;
    const brand = document.getElementById('productBrand').value;
    const model = document.getElementById('productModel').value;
    const attr = document.getElementById('productAttribute').value;
    const usage = document.getElementById('productUsage').value;

    const parts = [product, brand, model, attr, usage].filter(p => p.trim());
    const title = parts.join(' ').substring(0, 60);

    document.getElementById('titlePreview').textContent = title || '[Producto] [Marca] [Modelo] [Atributo] [Uso]';

    document.getElementById('tagProduct').textContent = product || 'Producto';
    document.getElementById('tagBrand').textContent = brand || 'Marca';
    document.getElementById('tagModel').textContent = model || 'Modelo';
    document.getElementById('tagAttr').textContent = attr || 'Atributo';
    document.getElementById('tagUse').textContent = usage || 'Uso';
}

function updateSpecsProgress() {
    const fields = ['specBrand', 'specModel', 'specMaterial', 'specColor', 'specWeight', 'specDimensions', 'specWarranty', 'specOrigin', 'specBriefDesc'];
    const filled = fields.filter(id => {
        const el = document.getElementById(id);
        return el && el.value.trim() !== '';
    }).length;

    const additionalFields = document.querySelectorAll('#additionalSpecs .dynamic-field');
    let additionalFilled = 0;
    additionalFields.forEach(field => {
        if (field.querySelector('.attr-name').value.trim() && field.querySelector('.attr-value').value.trim()) {
            additionalFilled++;
        }
    });

    const total = fields.length;
    const percent = Math.round(((filled + additionalFilled) / (total + 3)) * 100);
    document.getElementById('specsProgress').style.width = percent + '%';
    document.getElementById('specsPercent').textContent = percent + '% completado';
}

function addSpecField() {
    const container = document.getElementById('additionalSpecs');
    const div = document.createElement('div');
    div.className = 'dynamic-field';
    div.innerHTML = `
        <input type="text" class="attr-name" placeholder="Nombre del atributo">
        <input type="text" class="attr-value" placeholder="Valor">
        <button class="btn-remove" onclick="removeField(this)"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(div);

    div.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            updateSpecsProgress();
            updateScore();
        });
    });
}

function addBoxItem() {
    const container = document.getElementById('boxContents');
    const div = document.createElement('div');
    div.className = 'dynamic-field';
    div.innerHTML = `
        <input type="text" class="item-input" placeholder="Item incluido (Ej: Auriculares x1)">
        <button class="btn-remove" onclick="removeField(this)"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(div);
}

function addFeature() {
    const container = document.getElementById('featuresList');
    const div = document.createElement('div');
    div.className = 'dynamic-field feature-field';
    div.innerHTML = `
        <input type="text" class="feature-name" placeholder="Caracteristica">
        <i class="fas fa-arrow-right"></i>
        <input type="text" class="feature-benefit" placeholder="Beneficio para el comprador">
        <button class="btn-remove" onclick="removeField(this)"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(div);
}

function addFAQ() {
    const container = document.getElementById('faqList');
    const div = document.createElement('div');
    div.className = 'dynamic-field faq-field';
    div.innerHTML = `
        <input type="text" class="faq-question" placeholder="Pregunta del comprador">
        <input type="text" class="faq-answer" placeholder="Respuesta">
        <button class="btn-remove" onclick="removeField(this)"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(div);
}

function removeField(btn) {
    const field = btn.closest('.dynamic-field');
    field.remove();
}

function updatePhotoScore() {
    const checked = document.querySelectorAll('.photo-check:checked').length;
    document.querySelectorAll('.photo-item').forEach(item => {
        const cb = item.querySelector('.photo-check');
        if (cb.checked) {
            item.classList.add('checked');
        } else {
            item.classList.remove('checked');
        }
    });
    updateScore();
}

function calculatePrice() {
    const cost = parseFloat(document.getElementById('costProduct').value) || 0;
    const commission = parseFloat(document.getElementById('costCommission').value) || 13;
    const shipping = parseFloat(document.getElementById('costShipping').value) || 0;
    const margin = parseFloat(document.getElementById('costMargin').value) || 30;
    const fixed = parseFloat(document.getElementById('costFixed').value) || 0;

    const totalCost = cost + shipping + fixed;
    const price = totalCost / (1 - (commission / 100) - (margin / 100));
    const profit = price - (price * commission / 100) - totalCost;
    const roi = cost > 0 ? ((profit / cost) * 100) : 0;

    document.getElementById('suggestedPrice').textContent = '$' + Math.round(price).toLocaleString('es-AR');
    document.getElementById('netProfit').textContent = '$' + Math.round(profit).toLocaleString('es-AR');
    document.getElementById('roiValue').textContent = Math.round(roi) + '%';
}

function updateKeywordAnalysis() {
    const primary = document.getElementById('kwPrimary').value;
    const s1 = document.getElementById('kwSecondary1').value;
    const s2 = document.getElementById('kwSecondary2').value;
    const s3 = document.getElementById('kwSecondary3').value;
    const lt1 = document.getElementById('kwLongtail1').value;
    const lt2 = document.getElementById('kwLongtail2').value;

    const keywords = [primary, s1, s2, s3, lt1, lt2].filter(k => k.trim());
    const title = (document.getElementById('productName').value + ' ' +
                   document.getElementById('productBrand').value + ' ' +
                   document.getElementById('productModel').value + ' ' +
                   document.getElementById('productAttribute').value + ' ' +
                   document.getElementById('productUsage').value).toLowerCase();

    const container = document.getElementById('kwTagsInTitle');
    container.innerHTML = '';

    if (keywords.length === 0) {
        container.innerHTML = '<span style="color: var(--text-muted); font-size: 13px;">Ingresa palabras clave para analizarlas.</span>';
        return;
    }

    keywords.forEach(kw => {
        const tag = document.createElement('span');
        tag.className = 'kw-tag ' + (title.includes(kw.toLowerCase()) ? 'found' : 'missing');
        tag.textContent = kw;
        container.appendChild(tag);
    });
}

function updateScore() {
    let scoreTitle = 0;
    let scoreSpecs = 0;
    let scorePhotos = 0;
    let scoreDesc = 0;
    let scoreSeo = 0;

    const product = document.getElementById('productName').value;
    const brand = document.getElementById('productBrand').value;
    const category = document.getElementById('productCategory').value;
    const condition = document.querySelector('input[name="condition"]:checked');
    const titleLen = (product + ' ' + brand).trim().length;

    if (product) scoreTitle += 30;
    if (brand) scoreTitle += 25;
    if (category) scoreTitle += 20;
    if (condition) scoreTitle += 10;
    if (titleLen > 15) scoreTitle += 15;

    const specFields = ['specBrand', 'specModel', 'specMaterial', 'specColor', 'specWeight', 'specDimensions', 'specWarranty'];
    const specsFilled = specFields.filter(id => document.getElementById(id)?.value.trim()).length;
    scoreSpecs = Math.round((specsFilled / specFields.length) * 100);

    const photosChecked = document.querySelectorAll('.photo-check:checked').length;
    scorePhotos = Math.round((photosChecked / 10) * 100);

    const descIntro = document.getElementById('descIntro')?.value;
    const features = document.querySelectorAll('.feature-name');
    const faqs = document.querySelectorAll('.faq-question');
    if (descIntro) scoreDesc += 40;
    let featuresFilled = 0;
    features.forEach(f => { if (f.value.trim()) featuresFilled++; });
    scoreDesc += Math.min(30, featuresFilled * 10);
    let faqsFilled = 0;
    faqs.forEach(f => { if (f.value.trim()) faqsFilled++; });
    scoreDesc += Math.min(30, faqsFilled * 10);
    scoreDesc = Math.min(100, scoreDesc);

    const kwPrimary = document.getElementById('kwPrimary')?.value;
    const kwSecondary = [document.getElementById('kwSecondary1'), document.getElementById('kwSecondary2'), document.getElementById('kwSecondary3')];
    if (kwPrimary) scoreSeo += 40;
    let secFilled = 0;
    kwSecondary.forEach(k => { if (k?.value.trim()) secFilled++; });
    scoreSeo += Math.min(40, secFilled * 15);
    const longtails = [document.getElementById('kwLongtail1'), document.getElementById('kwLongtail2')];
    let ltFilled = 0;
    longtails.forEach(l => { if (l?.value.trim()) ltFilled++; });
    scoreSeo += ltFilled * 10;
    scoreSeo = Math.min(100, scoreSeo);

    const totalScore = Math.round((scoreTitle * 0.25 + scoreSpecs * 0.25 + scorePhotos * 0.2 + scoreDesc * 0.15 + scoreSeo * 0.15));

    document.getElementById('scoreTitle').textContent = scoreTitle + '%';
    document.getElementById('scoreSpecs').textContent = scoreSpecs + '%';
    document.getElementById('scorePhotos').textContent = scorePhotos + '%';
    document.getElementById('scoreDesc').textContent = scoreDesc + '%';
    document.getElementById('scoreSeo').textContent = scoreSeo + '%';

    const circle = document.getElementById('scoreCircle');
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (totalScore / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    if (totalScore >= 80) circle.style.stroke = '#00A650';
    else if (totalScore >= 50) circle.style.stroke = '#3483FA';
    else if (totalScore >= 25) circle.style.stroke = '#F5A623';
    else circle.style.stroke = '#F23D4F';

    document.getElementById('scoreValue').textContent = totalScore;
}

function generateOutput() {
    const product = document.getElementById('productName').value || '[Producto]';
    const brand = document.getElementById('productBrand').value || '[Marca]';
    const model = document.getElementById('productModel').value || '[Modelo]';
    const attr = document.getElementById('productAttribute').value || '';
    const usage = document.getElementById('productUsage').value || '';
    const category = document.getElementById('productCategory');
    const categoryName = category.options[category.selectedIndex]?.text || '';
    const subcategory = document.getElementById('productSubcategory').value || '';
    const condition = document.querySelector('input[name="condition"]:checked');
    const conditionText = condition?.value === 'new' ? 'Nuevo' : condition?.value === 'used' ? 'Usado' : 'Reacondicionado';
    const ean = document.getElementById('productEAN').value || '';

    const titleParts = [product, brand, model, attr, usage].filter(p => p.trim());
    const title = titleParts.join(' ').substring(0, 60);

    let specsText = 'FICHA TECNICA:\n';
    if (ean) specsText += `- Codigo universal: ${ean}\n`;
    specsText += `- Marca: ${brand}\n`;
    specsText += `- Modelo: ${model}\n`;
    specsText += `- Condicion: ${conditionText}\n`;

    const specFields = [
        { id: 'specMaterial', label: 'Material' },
        { id: 'specColor', label: 'Color' },
        { id: 'specDimensions', label: 'Dimensiones' },
        { id: 'specOrigin', label: 'Pais de origen' },
        { id: 'specWarranty', label: 'Garantia' }
    ];
    specFields.forEach(f => {
        const val = document.getElementById(f.id)?.value;
        if (val) specsText += `- ${f.label}: ${val}\n`;
    });

    const weightVal = document.getElementById('specWeight')?.value;
    const weightUnit = document.getElementById('specWeightUnit')?.value || 'g';
    if (weightVal) specsText += `- Peso: ${weightVal} ${weightUnit}\n`;

    document.querySelectorAll('#additionalSpecs .dynamic-field').forEach(field => {
        const name = field.querySelector('.attr-name')?.value;
        const value = field.querySelector('.attr-value')?.value;
        if (name && value) specsText += `- ${name}: ${value}\n`;
    });

    document.getElementById('outputSpecs').textContent = specsText;

    let descHtml = '';
    descHtml += `<strong>${product} ${brand} ${model} - ${attr}</strong>\n\n`;

    const intro = document.getElementById('descIntro')?.value;
    if (intro) descHtml += `${intro}\n\n`;

    const problem = document.getElementById('descProblem')?.value;
    if (problem) descHtml += `${problem}\n\n`;

    const boxItems = [];
    document.querySelectorAll('#boxContents .item-input').forEach(input => {
        if (input.value.trim()) boxItems.push(input.value.trim());
    });
    if (boxItems.length > 0) {
        descHtml += '<strong>QUE INCLUYE LA CAJA:</strong>\n';
        boxItems.forEach(item => {
            descHtml += `- ${item}\n`;
        });
        descHtml += '\n';
    }

    const features = [];
    document.querySelectorAll('.feature-field').forEach(field => {
        const name = field.querySelector('.feature-name')?.value;
        const benefit = field.querySelector('.feature-benefit')?.value;
        if (name && benefit) features.push({ name, benefit });
    });
    if (features.length > 0) {
        descHtml += '<strong>CARACTERISTICAS PRINCIPALES:</strong>\n';
        features.forEach(f => {
            descHtml += `- ${f.name}: ${f.benefit}\n`;
        });
        descHtml += '\n';
    }

    descHtml += '<strong>ESPECIFICACIONES TECNICAS:</strong>\n';
    const weightValDesc = document.getElementById('specWeight')?.value;
    const weightUnitDesc = document.getElementById('specWeightUnit')?.value || 'g';
    if (weightValDesc) descHtml += `- Peso: ${weightValDesc} ${weightUnitDesc}\n`;
    const dimDesc = document.getElementById('specDimensions')?.value;
    if (dimDesc) descHtml += `- Dimensiones: ${dimDesc}\n`;
    const matDesc = document.getElementById('specMaterial')?.value;
    if (matDesc) descHtml += `- Material: ${matDesc}\n`;
    const warrantyDesc = document.getElementById('specWarranty')?.value;
    if (warrantyDesc) descHtml += `- Garantia: ${warrantyDesc}\n`;
    descHtml += '\n';

    const faqs = [];
    document.querySelectorAll('.faq-field').forEach(field => {
        const q = field.querySelector('.faq-question')?.value;
        const a = field.querySelector('.faq-answer')?.value;
        if (q && a) faqs.push({ q, a });
    });
    if (faqs.length > 0) {
        descHtml += '<strong>PREGUNTAS FRECUENTES:</strong>\n';
        faqs.forEach(f => {
            descHtml += `- ${f.q} → ${f.a}\n`;
        });
        descHtml += '\n';
    }

    const shipping = document.getElementById('descShipping')?.value;
    if (shipping) {
        descHtml += '<strong>INFORMACION DE ENVIO Y GARANTIA:</strong>\n';
        descHtml += `${shipping}\n\n`;
    }

    const price = document.getElementById('suggestedPrice')?.textContent || '$0';
    const pubType = document.getElementById('pubType')?.value || 'premium';
    const installments = document.getElementById('installments')?.value || '6';
    const shippingType = document.getElementById('shippingType')?.value || 'full';
    const stock = document.getElementById('stockQty')?.value || '10';

    descHtml += '\n<strong>CONDICIONES DE VENTA:</strong>\n';
    descHtml += `- Precio: ${price}\n`;
    descHtml += `- Tipo de publicacion: ${pubType === 'premium' ? 'Premium' : 'Clasica'}\n`;
    descHtml += `- Cuotas: ${installments} cuotas sin interes\n`;
    descHtml += `- Envio: ${shippingType.toUpperCase()}\n`;
    descHtml += `- Stock: ${stock} unidades\n`;

    document.getElementById('outputDesc').innerHTML = descHtml;

    const kwPrimary = document.getElementById('kwPrimary')?.value || '';
    const kwS1 = document.getElementById('kwSecondary1')?.value || '';
    const kwS2 = document.getElementById('kwSecondary2')?.value || '';
    const kwS3 = document.getElementById('kwSecondary3')?.value || '';
    const kwLT1 = document.getElementById('kwLongtail1')?.value || '';
    const kwLT2 = document.getElementById('kwLongtail2')?.value || '';

    let kwText = 'PALABRAS CLAVE UTILIZADAS:\n';
    if (kwPrimary) kwText += `- Principal: ${kwPrimary}\n`;
    const secondaries = [kwS1, kwS2, kwS3].filter(k => k);
    if (secondaries.length) kwText += `- Secundarias: ${secondaries.join(', ')}\n`;
    const longtails = [kwLT1, kwLT2].filter(k => k);
    if (longtails.length) kwText += `- Long-tail en descripcion: ${longtails.join(', ')}\n`;

    document.getElementById('outputKeywords').textContent = kwText;

    document.getElementById('outputTitle').textContent = title;

    const fullOutput = `TITULO (${title.length}/60 caracteres):\n${title}\n\nCATEGORIA:\n${categoryName}${subcategory ? ' > ' + subcategory : ''}\n\n${specsText}\nDESCRIPCION:\n${descHtml.replace(/<strong>/g, '').replace(/<\/strong>/g, '')}\n\n${kwText}`;

    document.getElementById('outputFull').textContent = fullOutput;

    document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panelResult').classList.add('active');
    document.getElementById('panelResult').style.display = 'block';

    document.querySelectorAll('.step-item').forEach(item => {
        item.classList.add('completed');
        item.classList.remove('active');
    });

    showToast('Publicacion generada correctamente', 'success');
}

function showTab(tabId, event) {
    document.querySelectorAll('.output-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    if (event && event.currentTarget) event.currentTarget.classList.add('active');
}

function copySection(elementId) {
    const el = document.getElementById(elementId);
    const text = el.textContent || el.innerText;

    navigator.clipboard.writeText(text).then(() => {
        showToast('Copiado al portapapeles', 'success');
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copiado al portapapeles', 'success');
    });
}

function exportJSON() {
    const data = {
        titulo: document.getElementById('outputTitle')?.textContent || '',
        categoria: {
            principal: document.getElementById('productCategory')?.options[document.getElementById('productCategory').selectedIndex]?.text || '',
            especifica: document.getElementById('productSubcategory')?.value || ''
        },
        fichaTecnica: document.getElementById('outputSpecs')?.textContent || '',
        descripcion: document.getElementById('outputDesc')?.innerText || '',
        palabrasClave: document.getElementById('outputKeywords')?.textContent || '',
        precio: document.getElementById('suggestedPrice')?.textContent || '',
        tipoPublicacion: document.getElementById('pubType')?.value || '',
        cuotas: document.getElementById('installments')?.value || '',
        envio: document.getElementById('shippingType')?.value || '',
        stock: document.getElementById('stockQty')?.value || '',
        video: {
            hook: document.getElementById('videoHook')?.value || '',
            beneficios: document.getElementById('videoBenefits')?.value || '',
            prueba: document.getElementById('videoProof')?.value || '',
            cierre: document.getElementById('videoClosing')?.value || ''
        },
        fotosChecklist: Array.from(document.querySelectorAll('.photo-item')).map(item => ({
            numero: item.dataset.photo,
            titulo: item.querySelector('h4')?.textContent || '',
            completada: item.querySelector('.photo-check')?.checked || false
        }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'publicacion-ML-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(url);

    showToast('Archivo JSON exportado', 'info');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    toast.innerHTML = `<i class="fas ${icons[type]}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function saveToStorage() {
    const data = {
        productName: document.getElementById('productName')?.value || '',
        productBrand: document.getElementById('productBrand')?.value || '',
        productModel: document.getElementById('productModel')?.value || '',
        productCategory: document.getElementById('productCategory')?.value || '',
        productSubcategory: document.getElementById('productSubcategory')?.value || '',
        condition: document.querySelector('input[name="condition"]:checked')?.value || 'new',
        productAttribute: document.getElementById('productAttribute')?.value || '',
        productUsage: document.getElementById('productUsage')?.value || '',
        productEAN: document.getElementById('productEAN')?.value || '',
        specBrand: document.getElementById('specBrand')?.value || '',
        specModel: document.getElementById('specModel')?.value || '',
        specMaterial: document.getElementById('specMaterial')?.value || '',
        specColor: document.getElementById('specColor')?.value || '',
        specWeight: document.getElementById('specWeight')?.value || '',
        specWeightUnit: document.getElementById('specWeightUnit')?.value || 'g',
        specDimensions: document.getElementById('specDimensions')?.value || '',
        specWarranty: document.getElementById('specWarranty')?.value || '',
        specOrigin: document.getElementById('specOrigin')?.value || '',
        specBriefDesc: document.getElementById('specBriefDesc')?.value || '',
        descIntro: document.getElementById('descIntro')?.value || '',
        descProblem: document.getElementById('descProblem')?.value || '',
        descShipping: document.getElementById('descShipping')?.value || '',
        costProduct: document.getElementById('costProduct')?.value || '',
        costCommission: document.getElementById('costCommission')?.value || '13',
        costShipping: document.getElementById('costShipping')?.value || '',
        costMargin: document.getElementById('costMargin')?.value || '30',
        costFixed: document.getElementById('costFixed')?.value || '50',
        pubType: document.getElementById('pubType')?.value || 'premium',
        installments: document.getElementById('installments')?.value || '6',
        shippingType: document.getElementById('shippingType')?.value || 'full',
        stockQty: document.getElementById('stockQty')?.value || '10',
        kwPrimary: document.getElementById('kwPrimary')?.value || '',
        kwSecondary1: document.getElementById('kwSecondary1')?.value || '',
        kwSecondary2: document.getElementById('kwSecondary2')?.value || '',
        kwSecondary3: document.getElementById('kwSecondary3')?.value || '',
        kwLongtail1: document.getElementById('kwLongtail1')?.value || '',
        kwLongtail2: document.getElementById('kwLongtail2')?.value || '',
        videoHook: document.getElementById('videoHook')?.value || '',
        videoBenefits: document.getElementById('videoBenefits')?.value || '',
        videoProof: document.getElementById('videoProof')?.value || '',
        videoClosing: document.getElementById('videoClosing')?.value || '',
        additionalSpecs: [],
        boxContents: [],
        features: [],
        faqs: []
    };

    document.querySelectorAll('#additionalSpecs .dynamic-field').forEach(field => {
        data.additionalSpecs.push({
            name: field.querySelector('.attr-name')?.value || '',
            value: field.querySelector('.attr-value')?.value || ''
        });
    });

    document.querySelectorAll('#boxContents .item-input').forEach(input => {
        if (input.value.trim()) data.boxContents.push(input.value.trim());
    });

    document.querySelectorAll('.feature-field').forEach(field => {
        data.features.push({
            name: field.querySelector('.feature-name')?.value || '',
            benefit: field.querySelector('.feature-benefit')?.value || ''
        });
    });

    document.querySelectorAll('.faq-field').forEach(field => {
        data.faqs.push({
            q: field.querySelector('.faq-question')?.value || '',
            a: field.querySelector('.faq-answer')?.value || ''
        });
    });

    localStorage.setItem('optimlia_data', JSON.stringify(data));
}

function loadFromStorage() {
    const raw = localStorage.getItem('optimlia_data');
    if (!raw) return;

    try {
        const data = JSON.parse(raw);

        const simpleFields = ['productName', 'productBrand', 'productModel', 'productCategory', 'productSubcategory', 'productAttribute', 'productUsage', 'productEAN', 'specBrand', 'specModel', 'specMaterial', 'specColor', 'specWeight', 'specDimensions', 'specWarranty', 'specOrigin', 'specBriefDesc', 'descIntro', 'descProblem', 'descShipping', 'costProduct', 'costCommission', 'costShipping', 'costMargin', 'costFixed', 'pubType', 'installments', 'shippingType', 'stockQty', 'kwPrimary', 'kwSecondary1', 'kwSecondary2', 'kwSecondary3', 'kwLongtail1', 'kwLongtail2', 'videoHook', 'videoBenefits', 'videoProof', 'videoClosing'];

        simpleFields.forEach(id => {
            const el = document.getElementById(id);
            if (el && data[id]) el.value = data[id];
        });

        if (data.specWeightUnit) {
            const sel = document.getElementById('specWeightUnit');
            if (sel) sel.value = data.specWeightUnit;
        }

        const cond = document.querySelector(`input[name="condition"][value="${data.condition}"]`);
        if (cond) cond.checked = true;

        if (data.nameCount !== undefined) {
            document.getElementById('nameCount').textContent = data.productName.length;
        }
        if (data.descIntro) {
            document.getElementById('introCount').textContent = data.descIntro.length;
        }

        const specsContainer = document.getElementById('additionalSpecs');
        specsContainer.innerHTML = '';
        if (data.additionalSpecs && data.additionalSpecs.length > 0) {
            data.additionalSpecs.forEach(item => {
                addSpecField();
                const last = specsContainer.lastElementChild;
                last.querySelector('.attr-name').value = item.name;
                last.querySelector('.attr-value').value = item.value;
            });
        } else {
            addSpecField();
        }

        const boxContainer = document.getElementById('boxContents');
        boxContainer.innerHTML = '';
        if (data.boxContents && data.boxContents.length > 0) {
            data.boxContents.forEach(item => {
                addBoxItem();
                const last = boxContainer.lastElementChild;
                last.querySelector('.item-input').value = item;
            });
        } else {
            addBoxItem();
        }

        const featContainer = document.getElementById('featuresList');
        featContainer.innerHTML = '';
        if (data.features && data.features.length > 0) {
            data.features.forEach(f => {
                addFeature();
                const last = featContainer.lastElementChild;
                last.querySelector('.feature-name').value = f.name;
                last.querySelector('.feature-benefit').value = f.benefit;
            });
        } else {
            addFeature();
        }

        const faqContainer = document.getElementById('faqList');
        faqContainer.innerHTML = '';
        if (data.faqs && data.faqs.length > 0) {
            data.faqs.forEach(f => {
                addFAQ();
                const last = faqContainer.lastElementChild;
                last.querySelector('.faq-question').value = f.q;
                last.querySelector('.faq-answer').value = f.a;
            });
        } else {
            addFAQ();
        }

        updateSpecsProgress();
        calculatePrice();
        updateKeywordAnalysis();
    } catch (e) {
        console.warn('Error loading saved data:', e);
    }
}

let saveTimeout = null;
document.addEventListener('input', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveToStorage, 500);
});
