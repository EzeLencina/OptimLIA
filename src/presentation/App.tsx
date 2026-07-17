import { useCallback } from 'react';
import { usePublicationForm } from './hooks/usePublicationForm';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ProductStep } from './components/steps/ProductStep';
import { SpecsStep } from './components/steps/SpecsStep';
import { PhotosStep } from './components/steps/PhotosStep';
import { DescriptionStep } from './components/steps/DescriptionStep';
import { PricingStep } from './components/steps/PricingStep';
import { SeoStep } from './components/steps/SeoStep';
import { ResultPanel } from './components/steps/ResultPanel';
import { generateOutput } from '../domain/services/description.service';

function showToast(message: string, _type: string = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${_type}`;
  const icons: Record<string, string> = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle',
  };
  toast.innerHTML = `<i class="fas ${icons[_type] || icons.info}"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

export default function App() {
  const {
    formData,
    currentStep,
    showResult,
    score,
    priceCalc,
    title,
    keywordAnalysis,
    updateProduct,
    updateSpecs,
    updateAdditionalSpecs,
    updatePhotos,
    updateVideo,
    updateDescription,
    updatePricing,
    updateKeywords,
    goToStep,
    showResultPanel,
  } = usePublicationForm();

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(
      () => showToast('Copiado al portapapeles', 'success'),
      () => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copiado al portapapeles', 'success');
      }
    );
  }, []);

  const handleExportJSON = useCallback(() => {
    const output = generateOutput(formData, priceCalc.suggestedPrice);
    const categoryLabel = formData.product.category || 'Sin categoria';
    const data = {
      titulo: output.title,
      categoria: {
        principal: categoryLabel,
        especifica: formData.product.subcategory,
      },
      fichaTecnica: output.specsText,
      descripcion: output.descriptionHtml,
      palabrasClave: output.keywordsText,
      precio: priceCalc.suggestedPrice,
      tipoPublicacion: formData.pricing.publicationType,
      cuotas: formData.pricing.installments,
      envio: formData.pricing.shippingType,
      stock: formData.pricing.stock,
      video: formData.video,
      fotosChecklist: formData.photos.map((p) => ({
        numero: p.id,
        titulo: p.title,
        completada: p.checked,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `publicacion-ML-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Archivo JSON exportado', 'info');
  }, [formData, priceCalc]);

  const renderStep = () => {
    if (showResult) {
      const output = generateOutput(formData, priceCalc.suggestedPrice);
      return (
        <ResultPanel
          output={output}
          onEdit={() => goToStep(1)}
          onCopy={handleCopy}
          onExportJSON={handleExportJSON}
        />
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <ProductStep
            product={formData.product}
            onUpdate={updateProduct}
            onNext={() => goToStep(2)}
          />
        );
      case 2:
        return (
          <SpecsStep
            specs={formData.specs}
            additionalSpecs={formData.additionalSpecs}
            onUpdateSpecs={updateSpecs}
            onUpdateAdditional={updateAdditionalSpecs}
            onNext={() => goToStep(3)}
            onPrev={() => goToStep(1)}
          />
        );
      case 3:
        return (
          <PhotosStep
            photos={formData.photos}
            video={formData.video}
            onUpdatePhotos={updatePhotos}
            onUpdateVideo={updateVideo}
            onNext={() => goToStep(4)}
            onPrev={() => goToStep(2)}
          />
        );
      case 4:
        return (
          <DescriptionStep
            description={formData.description}
            onUpdate={updateDescription}
            onNext={() => goToStep(5)}
            onPrev={() => goToStep(3)}
          />
        );
      case 5:
        return (
          <PricingStep
            pricing={formData.pricing}
            priceCalc={priceCalc}
            onUpdate={(field, value) => updatePricing(field as never, value)}
            onNext={() => goToStep(6)}
            onPrev={() => goToStep(4)}
          />
        );
      case 6:
        return (
          <SeoStep
            keywords={formData.keywords}
            keywordAnalysis={keywordAnalysis}
            onUpdate={updateKeywords}
            onGenerate={showResultPanel}
            onPrev={() => goToStep(5)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <main className="main-layout">
        <Sidebar
          currentStep={currentStep}
          showResult={showResult}
          score={score}
          onStepClick={goToStep}
        />
        <section className="content">
          {renderStep()}
        </section>
      </main>
      <div className="toast-container" id="toastContainer" />
    </>
  );
}
