export async function showFeatureSidebar(properties, fieldTypes) {
    const sidebar = document.getElementById("rightSidebar");
    const gridContainer = document.getElementById("jsGrid");
  
    // Clear previous grid content
    gridContainer.innerHTML = '';
  
    // Open the sidebar by adding the "open" class
    sidebar.classList.add('open');
  
    // Create a form to hold the properties
    const form = document.createElement("form");
    form.id = "featureForm";
    form.style.display = 'grid';
    form.style.gridTemplateColumns = '1fr 2fr'; // 2 columns for labels and inputs
    form.style.gap = '10px'; // Add spacing between elements
  
    // Loop through the fieldTypes and create input fields based on type
    fieldTypes.forEach(field => {
      const fieldWrapper = document.createElement("div");
  
      const label = document.createElement("label");
      label.textContent = field.name;
      label.style.fontWeight = 'bold'; // Make labels bold
      label.style.alignSelf = 'center'; // Center labels vertically
      label.style.marginBottom = '5px';
      
      const input = document.createElement("input");
      const propertyValue = properties[field.name] || ""; // Get property value, default to empty if not available
  
      // Map field types to input types
      if (field.type.includes("string")) {
        input.type = "text";
      } else if (field.type.includes("int") || field.type.includes("float")) {
        input.type = "number";
      } else if (field.type.includes("date")) {
        input.type = "date";
      } else {
        input.type = "text"; // Default type
      }
  
      input.value = propertyValue;
      input.disabled = true; // Initially disable inputs for read-only view
      input.name = field.name;
      input.style.padding = '8px'; // Add padding to inputs
      input.style.width = '100%';  // Make input fields full-width
  
      form.appendChild(label);
      form.appendChild(input);
    });
  
    gridContainer.appendChild(form);
  
    // Add Edit Button to the form
    const editButton = document.createElement("button");
    editButton.id = "editButton";
    editButton.textContent = "Edit";
    editButton.style.padding = '10px 20px';
    editButton.style.backgroundColor = '#007BFF';
    editButton.style.color = '#fff';
    editButton.style.border = 'none';
    editButton.style.borderRadius = '4px';
    editButton.style.cursor = 'pointer';
  
    gridContainer.appendChild(editButton);
  
    // Handle edit mode toggle
    editButton.onclick = function (event) {
      event.preventDefault(); // Prevent form submission
      const inputs = document.querySelectorAll("#featureForm input");
      inputs.forEach(input => {
        input.disabled = !input.disabled;  // Toggle disabled state
      });
  
      if (inputs[0].disabled) {
        editButton.textContent = "Edit"; // Change button text to "Edit" when inputs are disabled
      } else {
        editButton.textContent = "Save"; // Change button text to "Save" when inputs are enabled
      }
    };
  
    // Close the sidebar when the close button is clicked
    document.querySelector('.closeSidebarBtn').onclick = function () {
      sidebar.classList.remove('open');
    };
  }
  
  
