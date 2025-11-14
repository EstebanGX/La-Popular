document.addEventListener('DOMContentLoaded', () => {
    const products = [
        { id: 'sandwich-comun', name: 'Sándwich Común', basePrice: 9000 },
        { id: 'sandwich-especial', name: 'Sándwich Especial', basePrice: 12000 },
        { id: 'super-lomito', name: 'Súper Lomito', basePrice: 10300 },
        { id: 'hamburguesa-comun', name: 'Hamburguesa Común + Papas', basePrice: 8000 },
        { id: 'hamburguesa-popular', name: 'Hamburguesa "Popular" + Papas', basePrice: 10000 },
    ];
    
    const extras = {
        queso: { name: '+ Queso', price: 1000 },
        papas: { name: '+ Papas', price: 2000 },
        'gaseosa-2l': { name: 'Gaseosa 2Lt', price: 5000 },
        'gaseosa-lata': { name: 'Lata de Gaseosa', price: 2000 },
        cerveza: { name: 'Cerveza', price: 2500 },
        'ninguna': { name: 'Sin Bebida', price: 0 }
    };

    let cart = [];
    let currentProduct = null;

    // Elementos del DOM
    const modal = document.getElementById('customize-modal');
    const closeModal = document.querySelector('.close-button');
    const confirmButton = document.getElementById('confirm-customization');
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const cartCountSpan = document.getElementById('cart-count');
    const checkoutForm = document.getElementById('checkout-form');
    const payButton = document.getElementById('pay-button');
    const clientNameInput = document.getElementById('client-name');
    const clientAddressInput = document.getElementById('client-address');
    const finalDrinksOfferDiv = document.getElementById('final-drinks-offer');

    // Funciones
    
    // Muestra/Oculta el botón de pagar basado en si hay productos y datos
    const checkPaymentButton = () => {
        const hasItems = cart.length > 0;
        const hasInfo = clientNameInput.value.trim() !== '' && clientAddressInput.value.trim() !== '';
        payButton.disabled = !(hasItems && hasInfo);
    };

    // Actualiza la visualización del carrito y el total
    const renderCart = () => {
        cartItemsDiv.innerHTML = '';
        let total = 0;
        
        if (cart.length === 0) {
            cartItemsDiv.innerHTML = '<p style="text-align: center; color: #888;">El carrito está vacío.</p>';
        }

        cart.forEach((item, index) => {
            const itemTotal = item.basePrice + item.extras.reduce((sum, extra) => sum + extra.price, 0);
            total += itemTotal;
            
            const extraDetails = item.extras.map(e => e.name).filter(n => n !== 'Sin Bebida').join(', ');

            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div>
                    <strong>${item.name}</strong> 
                    ${extraDetails ? `<br><small style="color: #ffc107;">(${extraDetails})</small>` : ''}
                </div>
                <div>
                    $${itemTotal.toLocaleString('es-AR')} 
                    <button class="remove-item" data-index="${index}" style="background: none; border: none; color: #ffc107; cursor: pointer; margin-left: 10px;">&times;</button>
                </div>
            `;
            cartItemsDiv.appendChild(itemElement);
        });

        cartTotalSpan.textContent = `$${total.toLocaleString('es-AR')}`;
        cartCountSpan.textContent = cart.length;
        checkPaymentButton();
        renderFinalDrinksOffer(); // Renderiza la oferta de bebidas al final
    };
    
    // Crea la oferta de bebidas antes de pagar (para el re-ofrecimiento)
    const renderFinalDrinksOffer = () => {
        finalDrinksOfferDiv.innerHTML = `
            <h4>¿Deseas agregar alguna bebida extra?</h4>
            <div class="options-group">
                <label><input type="radio" name="final-drink" data-extra="gaseosa-2l" data-price="5000"> Gaseosa 2Lt ($5000)</label>
                <label><input type="radio" name="final-drink" data-extra="gaseosa-lata" data-price="2000"> Lata de Gaseosa ($2000)</label>
                <label><input type="radio" name="final-drink" data-extra="cerveza" data-price="2500"> Cerveza ($2500)</label>
                <label><input type="radio" name="final-drink" data-extra="ninguna" checked> No, gracias</label>
            </div>
            <button id="add-final-drink" class="add-to-cart" style="margin-top: 10px; width: 100%;">Añadir Bebida al Pedido</button>
        `;
        document.getElementById('add-final-drink').addEventListener('click', addFinalDrink);
    };
    
    // Maneja la adición de la bebida final
    const addFinalDrink = (e) => {
        e.preventDefault();
        const selectedRadio = finalDrinksOfferDiv.querySelector('input[name="final-drink"]:checked');
        if (selectedRadio && selectedRadio.dataset.extra !== 'ninguna') {
            const extraKey = selectedRadio.dataset.extra;
            const extra = extras[extraKey];
            
            // Crea un ítem de "Bebida Extra" para el carrito
            const drinkItem = {
                name: extra.name,
                basePrice: extra.price,
                extras: []
            };
            cart.push(drinkItem);
            renderCart();
            // Resetea la opción a "No, gracias" para evitar doble clic
            finalDrinksOfferDiv.querySelector('input[name="final-drink"][data-extra="ninguna"]').checked = true;
        }
    };

    // Event Listeners del Menú (Abre el Modal)
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            const productId = productCard.dataset.product;
            
            // Encuentra el producto base
            currentProduct = products.find(p => p.id === productId);
            
            if (currentProduct) {
                document.getElementById('modal-product-name').textContent = `Personalizar ${currentProduct.name}`;
                // Resetea los inputs del modal
                modal.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
                modal.querySelector('input[name="drink"][data-extra="ninguna"]').checked = true;
                modal.style.display = 'block';
            }
        });
    });

    // Event Listener del Modal (Confirma y agrega al carrito)
    confirmButton.addEventListener('click', () => {
        if (!currentProduct) return;
        
        const selectedExtras = [];
        let itemTotal = currentProduct.basePrice;
        
        // Checkboxes (Queso, Papas)
        modal.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
            const extraKey = cb.dataset.extra;
            selectedExtras.push(extras[extraKey]);
            itemTotal += extras[extraKey].price;
        });

        // Radio Buttons (Bebida)
        const selectedDrink = modal.querySelector('input[name="drink"]:checked');
        if (selectedDrink) {
            const drinkKey = selectedDrink.dataset.extra;
            const drinkExtra = extras[drinkKey];
            selectedExtras.push(drinkExtra);
            itemTotal += drinkExtra.price;
        }

        // Añadir el producto al carrito
        cart.push({
            id: currentProduct.id,
            name: currentProduct.name,
            basePrice: currentProduct.basePrice,
            extras: selectedExtras,
            totalPrice: itemTotal
        });

        modal.style.display = 'none';
        currentProduct = null;
        renderCart();
    });

    // Event Listener para eliminar ítems
    cartItemsDiv.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item')) {
            const index = parseInt(e.target.dataset.index);
            cart.splice(index, 1);
            renderCart();
        }
    });

    // Cierra el modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        currentProduct = null;
    });

    // Cierra el modal si se clickea fuera de él
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            currentProduct = null;
        }
    });
    
    // Controlar el estado del botón de pagar
    clientNameInput.addEventListener('input', checkPaymentButton);
    clientAddressInput.addEventListener('input', checkPaymentButton);

    // Evento de Checkout (Pagar)
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (cart.length === 0) {
            alert('¡Tu carrito está vacío!');
            return;
        }

        const name = clientNameInput.value.trim();
        const address = clientAddressInput.value.trim();
        const total = cart.reduce((sum, item) => sum + item.totalPrice, 0); // Recalcular total por seguridad

        // Construir el mensaje de WhatsApp
        let message = `*PEDIDO LA POPULAR*\n\n`;
        message += `*Cliente:* ${name}\n`;
        message += `*Dirección:* ${address}\n\n`;
        message += `*Detalle del Pedido:*\n`;

        cart.forEach((item, index) => {
            const extrasList = item.extras.map(e => e.name).filter(n => n !== 'Sin Bebida').join(', ');
            message += `${index + 1}. ${item.name} (${item.basePrice.toLocaleString('es-AR')})\n`;
            if (extrasList) {
                message += `   - Agregados: ${extrasList}\n`;
            }
        });

        message += `\n*TOTAL A PAGAR: $${total.toLocaleString('es-AR')}*\n\n`;
        message += `*¡Gracias por tu compra!*\n*Zona de envío:* San Miguel de Tucumán y Banda del Río Salí.`;

        // Codificar el mensaje para la URL
        const encodedMessage = encodeURIComponent(message);
        const whatsappNumber = '3816983480'; // Número de WhatsApp destino
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        // Abrir WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Limpiar carrito y formulario después de enviar (simulación de pago/pedido)
        alert('¡Tu pedido ha sido enviado! Completa el proceso de pago por WhatsApp.');
        cart = [];
        clientNameInput.value = '';
        clientAddressInput.value = '';
        renderCart();
    });

    // Inicialización
    renderCart();
});