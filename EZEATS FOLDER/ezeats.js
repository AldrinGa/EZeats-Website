
document.addEventListener('DOMContentLoaded', () => {

    const navLinks = document.querySelectorAll(
        '.navbar-nav .nav-link'
    );

    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            navLinks.forEach(item => {
                item.classList.remove('active');
            });

            this.classList.add('active');
        });
    });


    // Group 5
    const STORAGE_KEY = 'ezeats_food_cart';

    const menuItems = [
        {
            id: 1,
            name: 'Sisig Meal',
            price: 80,
            image: 'images/sisig_meal.jpg'
        },
        {
            id: 2,
            name: 'Coca-Cola Can',
            price: 30,
            image: 'images/coke_can.webp'
        },
        {
            id: 3,
            name: '1 Piece Turon',
            price: 15,
            image: 'images/turon.jpg'
        },
        {
            id: 4,
            name: 'Sinigang Meal',
            price: 80,
            image: 'images/sinigang_meal.webp'
        },
        {
            id: 5,
            name: 'Chicken Meal',
            price: 50,
            image: 'images/chicken_meal.webp'
        }
    ];

    const extras = [
        {
            id: 'gravy',
            name: 'Extra Gravy',
            price: 10
        },
        {
            id: 'rice',
            name: 'Extra Rice',
            price: 15
        },
        {
            id: 'coke',
            name: 'Coca-Cola Can',
            price: 30
        },
        {
            id: 'iced-tea',
            name: 'Iced Tea',
            price: 30
        }
    ];

    let cart = [];
    let selectedFood = null;
    let selectedExtras = [];
    let previousFocus = null;


    // Group 5
    function formatPrice(amount) {
        return '₱' + amount.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function validExtras(values) {
        return Array.isArray(values)
            ? [...new Set(
                values.filter(id =>
                    extras.some(extra => extra.id === id)
                )
            )].sort()
            : [];
    }

    function cartKey(id, addons) {
        return id + ':' + validExtras(addons).join(',');
    }

    try {
        const savedCart = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || '[]'
        );

        if (Array.isArray(savedCart)) {
            savedCart.forEach(item => {
                if (
                    !menuItems.some(food => food.id === item.id) ||
                    !Number.isSafeInteger(item.quantity) ||
                    item.quantity <= 0
                ) {
                    return;
                }

                const addons = validExtras(item.addons);
                const key = cartKey(item.id, addons);

                const existing = cart.find(
                    entry => entry.key === key
                );

                if (existing) {
                    existing.quantity += item.quantity;
                } else {
                    cart.push({
                        key,
                        id: item.id,
                        quantity: item.quantity,
                        addons
                    });
                }
            });
        }
    } catch (error) {
        cart = [];
    }


    const cartItems = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const subtotal = document.getElementById('subtotal');
    const cartTotal = document.getElementById('cartTotal');

    const mobileCartTotal = document.getElementById(
        'mobileCartTotal'
    );

    const cartCount = document.getElementById('cartCount');

    const clearCartBtn = document.getElementById(
        'clearCartBtn'
    );

    const checkoutBtn = document.getElementById(
        'checkoutBtn'
    );

    const mobileCheckoutBtn = document.getElementById(
        'mobileCheckoutBtn'
    );

    const overlay = document.getElementById(
        'customizeOverlay'
    );

    const dialog = overlay.querySelector(
        '.customize-dialog'
    );

    const addonOptions = document.getElementById(
        'addonOptions'
    );

    const customizeTotal = document.getElementById(
        'customizeTotal'
    );


    // Group 5
    function saveCart() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(cart)
            );
        } catch (error) {
            console.warn(
                'Cart could not be saved.',
                error
            );
        }
    }

    function unitPrice(food, addons) {
        return food.price + addons.reduce((sum, id) => {
            const extra = extras.find(
                option => option.id === id
            );

            return sum + (extra ? extra.price : 0);
        }, 0);
    }

    function updateCustomizeTotal() {
        if (selectedFood) {
            customizeTotal.textContent = formatPrice(
                unitPrice(selectedFood, selectedExtras)
            );
        }
    }

    function openCustomize(id) {
        const food = menuItems.find(
            item => item.id === id
        );

        if (!food) return;

        selectedFood = food;
        selectedExtras = [];
        previousFocus = document.activeElement;

        document.getElementById(
            'customizeTitle'
        ).textContent = food.name;

        document.getElementById(
            'customizeBasePrice'
        ).textContent = formatPrice(food.price);

        const image = document.getElementById(
            'customizeImage'
        );

        image.src = food.image;
        image.alt = food.name;

        addonOptions.replaceChildren();

        extras.forEach(extra => {
            const button = document.createElement('button');

            button.type = 'button';
            button.className = 'addon-option';
            button.setAttribute('aria-pressed', 'false');

            button.innerHTML = `
                <span class="addon-check"
                      aria-hidden="true"></span>
                <span class="addon-name"></span>
                <span class="addon-price"></span>
            `;

            button.querySelector(
                '.addon-name'
            ).textContent = extra.name;

            button.querySelector(
                '.addon-price'
            ).textContent = '+' + formatPrice(extra.price);

            button.addEventListener('click', () => {
                if (selectedExtras.includes(extra.id)) {
                    selectedExtras = selectedExtras.filter(
                        id => id !== extra.id
                    );
                } else {
                    selectedExtras.push(extra.id);
                }

                const active = selectedExtras.includes(
                    extra.id
                );

                button.setAttribute(
                    'aria-pressed',
                    String(active)
                );

                button.querySelector(
                    '.addon-check'
                ).textContent = active ? '✓' : '';

                updateCustomizeTotal();
            });

            addonOptions.appendChild(button);
        });

        updateCustomizeTotal();

        overlay.hidden = false;
        document.body.classList.add('customize-open');

        dialog.focus();
    }

    function closeCustomize() {
        overlay.hidden = true;

        document.body.classList.remove(
            'customize-open'
        );

        selectedFood = null;
        selectedExtras = [];

        if (
            previousFocus &&
            previousFocus.isConnected
        ) {
            previousFocus.focus();
        }
    }

    function addToCart() {
        if (!selectedFood) return;

        const addons = validExtras(selectedExtras);
        const key = cartKey(selectedFood.id, addons);

        const existing = cart.find(
            item => item.key === key
        );

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                key,
                id: selectedFood.id,
                quantity: 1,
                addons
            });
        }

        saveCart();
        renderCart();
        closeCustomize();
    }

    function changeQuantity(key, amount) {
        const item = cart.find(
            entry => entry.key === key
        );

        if (!item) return;

        item.quantity += amount;

        if (item.quantity <= 0) {
            cart = cart.filter(
                entry => entry.key !== key
            );
        }

        saveCart();
        renderCart();
    }

    function removeFromCart(key) {
        cart = cart.filter(
            item => item.key !== key
        );

        saveCart();
        renderCart();
    }

    function clearCart() {
        if (!cart.length) return;

        if (!confirm(
            'Are you sure you want to clear your cart?'
        )) {
            return;
        }

        cart = [];

        saveCart();
        renderCart();
    }


    // Group 5
    function renderCart() {
        cartItems.replaceChildren();

        let total = 0;
        let totalQuantity = 0;

        emptyCart.style.display = cart.length
            ? 'none'
            : 'block';

        cart.forEach(cartItem => {
            const food = menuItems.find(
                item => item.id === cartItem.id
            );

            if (!food) return;

            const addons = validExtras(
                cartItem.addons
            );

            const itemTotal = unitPrice(
                food,
                addons
            ) * cartItem.quantity;

            total += itemTotal;
            totalQuantity += cartItem.quantity;

            const element = document.createElement('div');
            element.className = 'cart-item';

            const image = document.createElement('div');
            image.className = 'cart-item-image';

            const img = document.createElement('img');
            img.src = food.image;
            img.alt = food.name;
            img.loading = 'lazy';

            image.appendChild(img);

            const details = document.createElement('div');
            details.className = 'cart-item-details';

            const name = document.createElement('h4');
            name.className = 'cart-item-name';
            name.textContent = food.name;

            const price = document.createElement('p');
            price.className = 'cart-item-price';

            price.textContent = formatPrice(
                unitPrice(food, addons)
            ) + ' each';

            const addonsText = document.createElement('p');
            addonsText.className = 'cart-item-addons';

            addonsText.textContent = addons.length
                ? 'Add-ons: ' + addons.map(
                    id => extras.find(
                        extra => extra.id === id
                    ).name
                ).join(', ')
                : 'No add-ons';

            const controls = document.createElement('div');
            controls.className = 'cart-item-controls';

            const quantity = document.createElement('div');
            quantity.className = 'quantity-control';

            const minus = document.createElement('button');
            minus.type = 'button';
            minus.className = 'quantity-btn';
            minus.textContent = '−';

            minus.setAttribute(
                'aria-label',
                'Decrease ' + food.name
            );

            minus.addEventListener('click', () => {
                changeQuantity(cartItem.key, -1);
            });

            const number = document.createElement('span');
            number.className = 'quantity-number';
            number.textContent = cartItem.quantity;

            const plus = document.createElement('button');
            plus.type = 'button';
            plus.className = 'quantity-btn';
            plus.textContent = '+';

            plus.setAttribute(
                'aria-label',
                'Increase ' + food.name
            );

            plus.addEventListener('click', () => {
                changeQuantity(cartItem.key, 1);
            });

            quantity.append(minus, number, plus);

            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'remove-item-btn';
            remove.textContent = 'Remove';

            remove.addEventListener('click', () => {
                removeFromCart(cartItem.key);
            });

            controls.append(quantity, remove);

            details.append(
                name,
                price,
                addonsText,
                controls
            );

            const itemTotalElement = document.createElement(
                'div'
            );

            itemTotalElement.className = 'cart-item-total';
            itemTotalElement.textContent = formatPrice(
                itemTotal
            );

            element.append(
                image,
                details,
                itemTotalElement
            );

            cartItems.appendChild(element);
        });

        subtotal.textContent = formatPrice(total);
        cartTotal.textContent = formatPrice(total);
        mobileCartTotal.textContent = formatPrice(total);
        cartCount.textContent = totalQuantity;


        // Group 5
        const isEmpty = cart.length === 0;

        checkoutBtn.disabled = isEmpty;
        mobileCheckoutBtn.disabled = isEmpty;
        clearCartBtn.disabled = isEmpty;
    }


    // Group 5
    document.querySelectorAll(
        '.add-cart-btn'
    ).forEach(button => {
        button.addEventListener('click', () => {
            openCustomize(
                Number(button.dataset.id)
            );
        });
    });

    document.getElementById(
        'closeCustomize'
    ).addEventListener('click', closeCustomize);

    document.getElementById(
        'confirmAdd'
    ).addEventListener('click', addToCart);

    overlay.addEventListener('click', event => {
        if (event.target === overlay) {
            closeCustomize();
        }
    });

    overlay.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeCustomize();
            return;
        }

        if (event.key !== 'Tab') return;

        const focusable = [
            ...dialog.querySelectorAll(
                'button:not([disabled])'
            )
        ];

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (
            event.shiftKey &&
            document.activeElement === first
        ) {
            event.preventDefault();
            last.focus();
        } else if (
            !event.shiftKey &&
            document.activeElement === last
        ) {
            event.preventDefault();
            first.focus();
        } else if (
            document.activeElement === dialog
        ) {
            event.preventDefault();
            first.focus();
        }
    });

    document.getElementById(
        'menuSearch'
    ).addEventListener('input', event => {
        const query = event.target.value
            .trim()
            .toLowerCase();

        let shown = 0;

        document.querySelectorAll(
            '.menu-card'
        ).forEach(card => {
            const visible = card.dataset.name.includes(
                query
            );

            card.hidden = !visible;

            if (visible) shown++;
        });

        document.getElementById(
            'noMenuResults'
        ).hidden = shown > 0;
    });

    clearCartBtn.addEventListener(
        'click',
        clearCart
    );


    // Group 5
    function proceedToCheckout() {
        if (!cart.length) return;

        alert(
            'Your cart is ready! Checkout will be available ' +
            'once the ordering system is connected.'
        );
    }

    checkoutBtn.addEventListener(
        'click',
        proceedToCheckout
    );

    mobileCheckoutBtn.addEventListener(
        'click',
        proceedToCheckout
    );


    // Group 5
    const loginForm = document.getElementById(
        'loginForm'
    );

    if (loginForm) {
        loginForm.addEventListener('submit', event => {
            event.preventDefault();

            alert(
                'Login will be available once authentication is connected.'
            );
        });
    }

    renderCart();
});