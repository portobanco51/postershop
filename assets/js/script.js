const myModule = (() => {

    'use strict'

    // Ready State START
    $(() => { fetchData() })
    // Ready State END
    // Llamada Asíncrona START
    const fetchData = async () => {
        try {
            const res = await fetch('./assets/js/products.json');
            const data = await res.json();
            printProducts(data);
            buttonsData(data);
        } catch (error) {
            console.log(error)
        }
    }
    // Llamada Asíncrona END

    let cart = {};

    // Function para guardar datos en JSON format
    const saveLocal = (id, value) => {
        localStorage.setItem(id, JSON.stringify(value))
    }

    // Function para enseñar lista
    const productList = document.querySelector('#products-list')
    const printProducts = (data) => {
        const template = document.querySelector('#template-products').content;
        const fragment = document.createDocumentFragment();

        data.forEach(item => {
            template.querySelector('img').setAttribute('src', item.thumbnailUrl);
            template.querySelector('h5').innerText = item.title;
            template.querySelector('p').innerText = `$${item.precio}`;
            template.querySelector('button').dataset.id = item.id;
            const clone = template.cloneNode(true);
            fragment.appendChild(clone)
        });
        productList.appendChild(fragment)
    }

    // Function para enseñar carrito
    const items = document.querySelector('#items');
    const printCart = () => {

        items.innerHTML = '';

        const template = document.querySelector('#template-cart').content;
        const fragment = document.createDocumentFragment();

        Object.values(cart).forEach(item => {

            items.innerHTML = '';

            template.querySelector('th').innerText = item.id;
            template.querySelectorAll('td')[0].innerText = item.title;
            template.querySelectorAll('td')[1].innerText = item.quantity;
            template.querySelector('span').innerText = item.precio * item.quantity;

            template.querySelector('.btn-info').dataset.id = item.id;
            template.querySelector('.btn-danger').dataset.id = item.id;

            const clone = template.cloneNode(true);
            fragment.appendChild(clone);
        });

        items.appendChild(fragment);
        printFooter();
        buttonsAction();
    };

    // Function para enseñar opciones y total
    const footer = document.querySelector('#footer-cart');
    const printFooter = () => {
        footer.innerHTML = '';

        if (Object.keys(cart).length === 0) {
            footer.innerHTML = `<tr id="footer-cart"><th scope="row" colspan="5">Carrito vacío - comience a comprar!</th></tr>`
            return
        }

        const template = document.querySelector('#template-footer').content;
        const fragment = document.createDocumentFragment();
        const nQuantity = Object.values(cart).reduce((acc, { quantity }) => acc + quantity, 0);
        const nPrice = Object.values(cart).reduce((acc, { quantity, precio }) => acc + quantity * precio, 0);

        template.querySelectorAll('td')[0].textContent = nQuantity;
        template.querySelector('span').textContent = nPrice;

        const clone = template.cloneNode(true);

        fragment.appendChild(clone);
        footer.appendChild(fragment);

        saveLocal("Total Amount", `$${nPrice}`)

        const clearBtn = document.querySelector('#clear-cart');
        clearBtn.addEventListener('click', () => {
            swal('Se eliminarán los productos de tu carrito', '¿Desea continuar?', 'warning', {
                buttons: {
                    cancel: "Cancelar",
                    continuar: true,
                }
            })
                .then((value) => {
                    switch (value) {
                        case "continuar":
                            $('#contact-form').fadeOut("slow");
                            localStorage.clear();
                            cart = {};
                            printCart();
                            break;
                        default:
                            $('#contact-form').hide();
                            break;
                    }
                })
        });

        const orderBtn = document.querySelector('#order-cart');
        orderBtn.addEventListener('click', () => {
            swal('Se procederá a completar el formulario de compra', '¿Desea continuar?', 'warning', {
                buttons: {
                    cancel: "Cancelar",
                    continuar: true,
                }
            })
                .then((value) => {
                    switch (value) {
                        case "continuar":
                            if ($('#contact-form').is(":hidden")) {
                                $('#contact-form').slideDown("slow");
                            };
                        default:
                            break;
                    }
                })
        })
    };

    // Function funcionalidad de botón en cards
    const buttonsData = (data) => {

        const buttons = document.querySelectorAll('.card button');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {

                const item = data.find(item => item.id === parseInt(btn.dataset.id));
                item.quantity = 1;

                if (cart.hasOwnProperty(item.id)) {
                    item.quantity = cart[item.id].quantity + 1;
                }

                cart[item.id] = { ...item };
                saveLocal('cart', cart);
                printCart();
            });
        });
    }

    // Function funcionalidad de botones en cart
    const buttonsAction = () => {

        const addBtn = document.querySelectorAll('#items .btn-info');
        const removeBtn = document.querySelectorAll('#items .btn-danger');

        addBtn.forEach(btn => {
            btn.addEventListener('click', () => {
                const item = cart[btn.dataset.id];
                item.quantity++;
                cart[btn.dataset.id] = { ...item };

                cart[item.id] = { ...item };
                saveLocal('cart', cart);
                printCart();
            })
        });
        removeBtn.forEach(btn => {
            btn.addEventListener('click', () => {
                const item = cart[btn.dataset.id];
                item.quantity--
                if (item.quantity === 0) {
                    delete cart[btn.dataset.id];
                    saveLocal('cart', cart);
                    localStorage.removeItem("Total Amount");
                } else {
                    cart[btn.dataset.id] = { ...item };
                    cart[item.id] = { ...item };
                    saveLocal('cart', cart);
                };
                printCart();

            })
        });

        $('#btnReset').on('click', (e) => {
            e.preventDefault();
            swal('Se perderán los datos ingresados', '¿Desea continuar?', 'warning', {
                buttons: {
                    cancel: "Cancelar",
                    continuar: true,
                }
            })
                .then((value) => {
                    switch (value) {
                        case "continuar":
                            form.reset();
                            $("#errorMessage").html("");
                            break;
                        default:
                            break;
                    }
                })
        });

    };

    // Validación de formulario con peticiones AJAX & JQuery 
    const form = document.forms['contactForm'];
    $('#contactForm').submit((e) => {

        if ($("#name").val() == "") {
            e.preventDefault();
            $("#errorMessage").html("<br />Nombre requerido <br />");
            return false;
        }
        else if ($("#email").val() == "") {
            e.preventDefault();
            $("#errorMessage").html("<br />Correo electrónico requerido <br />");
            return false;
        } else if ($("#phone").val() == "") {
            e.preventDefault();
            $("#errorMessage").html("<br />Teléfono requerido <br />");
            return false;
        } else {
            e.preventDefault();

            $("#errorMessage").html("");

            sessionStorage.setItem(`${$('#name').val()} Info`, JSON.stringify({ username: $("#name").val(), email: $("#email").val(), phone: $("#phone").val() }))

            form.reset();
            swal("ENVIADO!", "Te estaremos contactando lo antes posible!", "success", {
                buttons: false,
                timer: 3000,
            });
            $('#contact-form').fadeOut("slow");
            cart = {};
            printCart();
            localStorage.clear();
        };

        let url = "https://jsonplaceholder.typicode.com/users"

        let xhra = $.post(url, { username: $("#name").val(), email: $("#email").val(), phoneNumber: $("#phone").val() });

        xhra.done((data) => {
            if (data == 0) {
                e.preventDefault();
                $("#errorMessage").html("Datos incompletos <br />");
            }
            else if (data == 1) {
                $("#errorMessage").html("Enviado <br />");
            }
        });

        xhra.fail(() => {
            swal(`Oops : ${xhra.status} ${xhra.statusText}`, '¡Algo salió mal!', 'error', {
                buttons: false,
                timer: 3000,
            });
        })

    });

    // Validación para siempre pintar el carrito guardado
    let localCart = JSON.parse(localStorage.getItem("cart"));
    if (localCart !== null) {
        cart = localCart;
        printCart();
    }

})();

