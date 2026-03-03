function togglePregnancy() {
    const isFemale = document.getElementById('female').checked;
    const pregInput = document.getElementById('pregnancies');
    const pregGroup = document.getElementById('preg-group');

    if (isFemale) {
        pregInput.disabled = false;
        pregGroup.style.opacity = "1";
        pregGroup.style.pointerEvents = "auto";
    } else {
        pregInput.disabled = true;
        pregInput.value = "0"; // Reset value for males
        pregGroup.style.opacity = "0.5";
        pregGroup.style.pointerEvents = "none";
    }
}

document.getElementById('prediction-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Collecting data for the Python ML Microservice
    const formData = {
        pregnancies: document.getElementById('pregnancies').value || 0,
        glucose: document.getElementById('glucose').value,
        bloodPressure: document.getElementById('bp').value,
        bmi: document.getElementById('bmi').value,
        age: document.getElementById('age').value,
        skin: document.getElementById('skin').value,
        insulin: document.getElementById('insulin').value,
        dpf: document.getElementById('dpf').value
    };

    console.log("Data sent to Java Spring Boot API:", formData);
    alert("Analysis Started! The system is using Random Forest and Logistic Regression to calculate your risk scores.");
});
 function showView(role) {
            const pMenu = document.getElementById('patient-menu');
            const dMenu = document.getElementById('doctor-menu');
            const roleText = document.getElementById('current-role-text');

            if (role === 'patient') {
                pMenu.style.display = 'block';
                dMenu.style.display = 'none';
                roleText.innerText = 'Patient';
            } else {
                pMenu.style.display = 'none';
                dMenu.style.display = 'block';
                roleText.innerText = 'Medical Staff';
            }
        }