const ArrowModule = (function () {
    'use strict';

    const _canvas_container = document.getElementById('canvas_container');
    const _canvas = document.getElementById('arrow_canvas');
    const _ctx = _canvas.getContext('2d');
    let _image;
    const _arrows = [];
    let _arrowCounter = 1;
    let _drawing = false;
    let _imageLoaded = false;
    let _arrowColor = 'black';
    let _marginLeft, _marginTop;

    // Declare _arrows as a global variable
    window._arrows = _arrows;

    function _drawArrow(startX, startY, endX, endY, number, color) {
        _ctx.beginPath();
        _ctx.moveTo(startX, startY);
        _ctx.lineTo(endX, endY);
        _ctx.strokeStyle = color;
        _ctx.lineWidth = 2;
        _ctx.stroke();

        const angle = Math.atan2(endY - startY, endX - startX);
        const arrowSize = 10;
        _ctx.beginPath();
        _ctx.moveTo(
            endX - arrowSize * Math.cos(angle - Math.PI / 6),
            endY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        _ctx.lineTo(endX, endY);
        _ctx.lineTo(
            endX - arrowSize * Math.cos(angle + Math.PI / 6),
            endY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        _ctx.fillStyle = color;
        _ctx.fill();
        _ctx.stroke();

        const textX = endX + 20 * Math.cos(angle);
        const textY = endY + 20 * Math.sin(angle);


        _ctx.font = '20px Arial';
        _ctx.fillStyle = color;
        _ctx.fillText(number, textX, textY);

    }

    // Initial state of the "Test" button
    const openModalButton = document.getElementById('open_modal_btn');
    openModalButton.disabled = true;  // Initially disable the button
    openModalButton.style.backgroundColor = 'white'; // Reset to default background color



    function _updateArrowList() {
        const arrow_list = document.getElementById('arrow_list');
        arrow_list.innerHTML = '';

        const openModalButton = document.getElementById('open_modal_btn');

        // Check if all inputs have some text
        const allInputsFilled = Array.from(arrow_list.querySelectorAll('.arrow-field')).every(input => input.value.trim() !== '');

        if (_arrows.length === 0 || !allInputsFilled) {
            openModalButton.disabled = false;
            openModalButton.style.backgroundColor = '';
        } else {
            openModalButton.disabled = false;
            openModalButton.style.backgroundColor = ''; // Reset to default background color
        }

        const arrowList = document.getElementById('arrow_list');
        const arrowFragment = document.createDocumentFragment();

        _arrows.forEach((arrow, index) => {
            const arrowContainer = document.createElement('div');
            arrowContainer.classList.add('arrow-container');

            const inputContainer = document.createElement('div');
            inputContainer.classList.add('arrow-input-container');

            const label = document.createElement('label');
            label.textContent = arrow.number;
            label.classList.add('arrow-label');
            inputContainer.appendChild(label);

            const textField = document.createElement('input');
            textField.type = 'text';
            textField.value = arrow.description || '';
            textField.classList.add('arrow-field');
            textField.dataset.arrowIndex = index;

            textField.addEventListener('input', (e) => {
                arrow.description = e.target.value;
            });

            inputContainer.appendChild(textField);

            arrowContainer.appendChild(inputContainer);

            const validationMessage = document.createElement('span');
            validationMessage.textContent = 'please fill this field';
            arrowContainer.appendChild(validationMessage);

            arrowFragment.appendChild(arrowContainer);
        });

        arrowList.appendChild(arrowFragment);

    }


    function _handleMouseDown(e) {
        if (_imageLoaded) {
            const startX = e.clientX - _canvas.getBoundingClientRect().left;
            const startY = e.clientY - _canvas.getBoundingClientRect().top;

            if (
                startX >= _marginLeft &&
                startY >= _marginTop &&
                startX <= _canvas.width - _marginLeft &&
                startY <= _canvas.height - _marginTop
            ) {
                _drawing = true;

                const arrow = {
                    startX: startX - _marginLeft,
                    startY: startY - _marginTop,
                    endX: startX - _marginLeft,
                    endY: startY - _marginTop,
                    number: _arrowCounter,
                    color: _arrowColor,
                };

                _arrows.push(arrow);
                _arrowCounter++;

                _updateArrowList();

                // Disable the open modal button when drawing
                document.getElementById('open_modal_btn').disabled = true;
                document.getElementById('open_modal_btn').style.backgroundColor = '#666e6c';

                const handleMouseMove = (e) => {
                    if (_drawing) {
                        arrow.endX = e.clientX - _canvas.getBoundingClientRect().left - _marginLeft;
                        arrow.endY = e.clientY - _canvas.getBoundingClientRect().top - _marginTop;

                        _ctx.clearRect(0, 0, _canvas.width, _canvas.height);

                        if (_image) {
                            _ctx.drawImage(
                                _image,
                                _marginLeft,
                                _marginTop,
                                _canvas.width - 2 * _marginLeft,
                                _canvas.height - 2 * _marginTop
                            );
                        }

                        _arrows.forEach((existingArrow) => {
                            _drawArrow(
                                existingArrow.startX + _marginLeft,
                                existingArrow.startY + _marginTop,
                                existingArrow.endX + _marginLeft,
                                existingArrow.endY + _marginTop,
                                existingArrow.number,
                                existingArrow.color
                            );
                        });

                        _drawArrow(
                            arrow.startX + _marginLeft,
                            arrow.startY + _marginTop,
                            arrow.endX + _marginLeft,
                            arrow.endY + _marginTop,
                            arrow.number,
                            arrow.color
                        );
                    }
                };

                document.addEventListener('mousemove', handleMouseMove);

                const handleMouseUp = () => {
                    if (_drawing) {
                        _drawing = false;
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);

                        // Check if all inputs have some text
                        const allInputsFilled = Array.from(document.querySelectorAll('.arrow-field')).every(input => input && input.value && input.value.trim() !== '');

                        const openModalButton = document.getElementById('open_modal_btn');

                        if (_arrows.length === 0 || !allInputsFilled) {
                            openModalButton.disabled = false;
                            openModalButton.style.backgroundColor = '';
                        } else {
                            openModalButton.disabled = false;
                            openModalButton.style.backgroundColor = '';
                        }
                    }
                };

                document.addEventListener('mouseup', handleMouseUp);


            }
        }
    }


    function _handleImageUpload(e) {
        _arrows.length = 0;
        _arrowCounter = 1;

        _image = new Image();
        _image.src = URL.createObjectURL(e.target.files[0]);
        _image.onload = () => {
            _imageLoaded = true;

            const aspectRatio = _image.width / _image.height;
            const containerWidth = _canvas_container.offsetWidth;
            const maxCanvasWidth = 1200;
            const minPaddingCanvasWidth = 400; // Adjust this threshold as needed

            _canvas.width = Math.min(containerWidth, maxCanvasWidth);
            _canvas.height = _canvas.width / aspectRatio;

            const maxCanvasHeight = 440;
            if (_canvas.height > maxCanvasHeight) {
                _canvas.height = maxCanvasHeight;
                _canvas.width = _canvas.height * aspectRatio;
            }

            // Calculate padding based on canvas width
            let paddingX = 0.2 * _canvas.width;
            const paddingY = 0.1 * _canvas.height;

            // Adjust padding if canvas width is smaller than the threshold
            if (_canvas.width < minPaddingCanvasWidth) {
                paddingX = 0.9 * _canvas.width;
            }

            // Check if canvas dimensions need adjustment
            if (paddingX !== 0.2 * _canvas.width || _canvas.width < minPaddingCanvasWidth) {
                // Adjust canvas dimensions considering padding
                _canvas.width += 2 * paddingX;
                _canvas.height += 2 * paddingY;

                // Set margins based on padding
                _marginLeft = paddingX;
                _marginTop = paddingY;
            } else {
                // No adjustment needed, set margins to default values
                _marginLeft = 0.2 * _canvas.width;
                _marginTop = 0.1 * _canvas.height;
            }

            _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
            _ctx.drawImage(
                _image,
                _marginLeft,
                _marginTop,
                _canvas.width - 2 * _marginLeft,
                _canvas.height - 2 * _marginTop
            );

            _updateArrowList();
        };
    }


    const removeLastArrowButton = document.getElementById('remove_last_arrow_button');
    removeLastArrowButton.addEventListener('click', _removeLastArrow);

    function _removeLastArrow() {
        if (_arrows.length > 0) {
            _arrows.pop(); // Remove the last arrow from the array
            _arrowCounter--; // Decrement the arrow counter

            _updateArrowList();

            // Clear the canvas and redraw the remaining arrows
            _ctx.clearRect(0, 0, _canvas.width, _canvas.height);

            if (_image) {
                _ctx.drawImage(
                    _image,
                    _marginLeft,
                    _marginTop,
                    _canvas.width - 2 * _marginLeft,
                    _canvas.height - 2 * _marginTop
                );
            }

            _arrows.forEach((existingArrow) => {
                _drawArrow(
                    existingArrow.startX + _marginLeft,
                    existingArrow.startY + _marginTop,
                    existingArrow.endX + _marginLeft,
                    existingArrow.endY + _marginTop,
                    existingArrow.number,
                    existingArrow.color
                );
            });
        }
    }

    const arrowListContainer = document.getElementById('arrow_list');



    function checkResults() {
        const modalInputsHidden = document.getElementById('modal_arrow_list').querySelectorAll('.input-hidden-answer');
        const modalInputsVisible = document.getElementById('modal_arrow_list').querySelectorAll('.input-user-answer');
        const modalInputsDefault = document.getElementById('modal_arrow_list').querySelectorAll('.input-default-answer');

        const results = [];

        for (let index = 0; index < _arrows.length; index++) {
            const inputHidden = modalInputsHidden[index];
            const inputVisible = modalInputsVisible[index];
            const inputDefault = modalInputsDefault[index];

            const originalValue = (_arrows[index].description ? _arrows[index].description : '').trim().toLowerCase();
            const inputValue = (inputVisible.value ? inputVisible.value : '').trim().toLowerCase();

            // Check if the user input is not empty before proceeding
            if (inputValue !== '') {
                results.push({
                    arrowNumber: _arrows[index].number,
                    isMatch: inputValue === originalValue,
                });

                // Change the style based on the match result for the hidden input
                if (inputValue === originalValue) {
                    inputHidden.removeAttribute('type');
                    inputHidden.style.backgroundColor = '#008000d4'; // Green background
                    inputHidden.style.color = 'white';
                } else {
                    inputHidden.removeAttribute('type');
                    inputHidden.style.backgroundColor = '#da0505d9'; // Red background
                    inputHidden.style.color = 'white';
                }

                // Hide the default input and show the user input
                inputDefault.style.display = 'none';
                inputVisible.style.display = 'block';
            }

        }
    }

    // Rest of the code remains unchanged



    // Add click event listener to the "Check Result" button
    const checkResultButton = document.getElementById('check_result');
    checkResultButton.addEventListener('click', checkResults);

    function _changeColor(color) {
        _arrowColor = color;
    }

    function _changeColorHandler(color) {
        return function () {
            ArrowModule.changeColor(color);
        };
    }

    const colorButtons = document.querySelectorAll('.color-button');
    colorButtons.forEach(button => {
        const color = button.id.replace('color_button_', ''); // Extract color from button id
        button.addEventListener('click', _changeColorHandler(color));
    });


    // Function to open the modal
    function openModal() {
        const modal = document.getElementById('my_modal');
        modal.style.display = 'flex';
        document.getElementById("canvas_container").style.display = 'none';
    }

    function closeModal() {
        const modal = document.getElementById('my_modal');
        modal.style.display = 'none';
        document.getElementById("canvas_container").style.display = 'flex';
    }

    function showCanvasContentInModal(e) {
        e.preventDefault();
    
        // Check if any input is empty before opening the modal
        const emptyInputs = Array.from(document.querySelectorAll('#arrow_list input')).filter(input => input.value.trim() === '');
    
        if (emptyInputs.length > 0) {
            // Apply red border to empty inputs and their associated spans
            emptyInputs.forEach(input => {
                input.style.border = '1px solid red';
    
                // Find the associated span
                const span = input.parentElement.nextElementSibling;
    
                if (span && span.tagName.toLowerCase() === 'span') {
                    span.style.display = 'block';
                }
            });
            return; // Don't proceed if there's any empty input
        }
    
        // Reset borders to default
        Array.from(document.querySelectorAll('#arrow_list input')).forEach(input => {
            input.style.border = '1px solid #ccc';
    
            // Find the associated span
            const span = input.parentElement.nextElementSibling;
    
            if (span && span.tagName.toLowerCase() === 'span') {
                span.style.display = 'none';
            }
        });
        
    

        // Calculate the left border position of the canvas from the left side of the page
        const canvasRect = _canvas.getBoundingClientRect();
        const canvasLeftPosition = canvasRect.left;
    
        // Calculate the top border position of the canvas from the top side of the page
        const canvasTopPosition = canvasRect.top;
    
        // Pass both canvasLeftPosition and canvasTopPosition to showCanvasContentInModalWithArrows
        showCanvasContentInModalWithArrows(_arrows, canvasLeftPosition, canvasTopPosition);
        // Open the modal
        openModal();
    }
    


    // Inside the function showCanvasContentInModalWithArrows

    function showCanvasContentInModalWithArrows(arrows, canvasLeftPosition, canvasTopPosition) {
        const modalImage = document.getElementById('modal_image');
        const modalInputs = document.getElementById('modal_arrow_list');

        // Clear existing inputs
        modalInputs.innerHTML = '';
        // Clear modal_image_inputs_container existing inputs
        document.getElementById("modal_image_inputs_container").innerHTML = '';
        // Capture the content of the canvas
        const canvasDataUrl = document.getElementById('arrow_canvas').toDataURL('image/png');

        // Set the captured content as the source of the modal image
        modalImage.src = canvasDataUrl;

        // Generate input fields based on arrows
        arrows.forEach((arrow) => {
            const angle = Math.atan2(arrow.endY - arrow.startY, arrow.endX - arrow.startX);

            const inputContainer = document.createElement('div');
            inputContainer.classList.add('input-container');

            const label = document.createElement('label');
            label.classList.add('model-input-label');
            label.textContent = `${arrow.number}`;
            inputContainer.appendChild(label);

            // First input (visible)
            const userTextField = document.createElement('input');
            userTextField.type = 'text';
            userTextField.value = arrow.additionalText || '';
            userTextField.classList.add('arrow-field');
            userTextField.classList.add('input-user-answer');
            userTextField.required = true; // Add the required attribute

            userTextField.dataset.arrowIndex = arrows.indexOf(arrow);

            userTextField.addEventListener('input', (e) => {
                arrow.additionalText = e.target.value;
            });

            inputContainer.appendChild(userTextField);

            // Second input (hidden)
            const hiddenTextField = document.createElement('input');
            hiddenTextField.type = 'hidden';
            hiddenTextField.value = arrow.description || '';
            hiddenTextField.readOnly = true;
            hiddenTextField.classList.add('arrow-field');
            hiddenTextField.classList.add('input-hidden-answer');

            hiddenTextField.dataset.arrowIndex = arrows.indexOf(arrow);

            hiddenTextField.addEventListener('input', (e) => {
                arrow.description = e.target.value;
            });

            inputContainer.appendChild(hiddenTextField);

            // Third input (visible initially with default text)
            const defaultTextField = document.createElement('input');
            defaultTextField.type = 'text';
            defaultTextField.value = 'Click Result button to view result';
            defaultTextField.readOnly = true;
            defaultTextField.classList.add('arrow-field');
            defaultTextField.classList.add('input-default-answer');

            inputContainer.appendChild(defaultTextField);

            // Calculate adjusted position based on canvas dimensions and canvasLeftPosition, canvasTopPosition
            let textX, textY;

            if (arrow.endX > arrow.startX) {
                // Arrow is drawn towards the right
                textX = arrow.endX + 20 * Math.cos(angle) + _marginLeft + canvasLeftPosition;
                textY = arrow.endY + 20 * Math.sin(angle) + _marginTop - "24";
            } else {
                // Arrow is drawn towards the left
                textX = arrow.endX + 20 * Math.cos(angle) + _marginLeft + canvasLeftPosition - "230";
                textY = arrow.endY + 20 * Math.sin(angle) + _marginTop - "24";
            }

            // Fourth input (visible initially with default text)
            const newTextField = document.createElement('input');
            newTextField.type = 'text';
            newTextField.value = arrow.description || ''; // Set the default value for the new input
            newTextField.readOnly = true;
            newTextField.classList.add('new-text-input'); // Add a class to the input

            // Additional code for adjusting the position of the new input
            newTextField.style.left = `${textX}px`; // Adjust the left position based on canvas and canvasLeftPosition
            newTextField.style.top = `${textY}px`; // Adjust the top position based on canvas and canvasTopPosition

            document.getElementById("modal_image_inputs_container").appendChild(newTextField);


            modalInputs.appendChild(inputContainer);
        });

        // Open the modal
        openModal();
    }



    const open_modal_btn = document.getElementById('open_modal_btn');
    open_modal_btn.addEventListener('click', showCanvasContentInModal);

    // Add click event listener to the close button inside the modal
    const close_modal_btn = document.getElementById('close_modal_btn');
    close_modal_btn.addEventListener('click', closeModal);

    _canvas_container.addEventListener('mousedown', _handleMouseDown);

    const _image_upload = document.getElementById('image_upload');
    _image_upload.addEventListener('change', _handleImageUpload);

    return {
        changeColor: _changeColor,
 };



})();
