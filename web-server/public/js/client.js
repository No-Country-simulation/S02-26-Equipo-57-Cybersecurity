document.addEventListener('DOMContentLoaded', () => {
    const scanBtn = document.getElementById('btn-scan');
    const resultsContainer = document.getElementById('scan-results');
    const resultsContent = document.getElementById('results-content');

    scanBtn.addEventListener('click', async () => {
        // UI Loading State
        const originalText = scanBtn.innerText;
        scanBtn.disabled = true;
        scanBtn.innerText = 'Escaneando... (Conectando con Python Engine)';
        resultsContainer.classList.add('d-none');

        try {
            // Petición al Backend Node.js (que llamará a Python)
            const response = await fetch('/api/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    target_url: 'http://localhost:3000', // Escaneo a sí mismo por defecto
                    scan_type: 'quick'
                })
            });

            const data = await response.json();

            // Mostrar Resultados
            resultsContainer.classList.remove('d-none');
            resultsContent.textContent = JSON.stringify(data, null, 2);

        } catch (error) {
            console.error('Error:', error);
            alert('Error al conectar con el servidor. Revisa la consola.');
        } finally {
            scanBtn.disabled = false;
            scanBtn.innerText = originalText;
        }
    });
});
