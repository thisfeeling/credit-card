// Helper para obtener elementos del DOM de forma tipada
function qs<T extends HTMLElement = HTMLElement>(id: string): T {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Elemento con id '${id}' no encontrado`);
    return el as T;
}

const tarjetas: CreditCard[] = [];
let tarjetaActual: CreditCard | null = null;

class CreditCard {
    userId: number;
    firstName: string;
    lastName: string;
    cardId: string;
    cvv: number;
    expirationDate: string;
    balance: number;
    constructor(
        userId: number,
        firstName: string,
        lastName: string,
        cardId: string,
        cvv: number,
        expirationDate: string,
        balance: number
    ) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.cardId = cardId;
        this.cvv = cvv;
        this.expirationDate = expirationDate;
        this.balance = balance;
    }

    mostrarInformacion(): void {
        qs('userId').textContent = String(this.userId);
        qs('firstName').textContent = this.firstName;
        qs('lastName').textContent = this.lastName;
        qs('cardId').textContent = this.cardId;
        qs('cvv').textContent = String(this.cvv);
        qs('expirationDate').textContent = this.expirationDate;
        
        const balanceElement = qs('balance');
        balanceElement.textContent = `$${this.balance.toLocaleString()}`;
        
        if (this.balance > 0) {
            balanceElement.className = 'info-value saldo-positivo';
        } else if (this.balance < 0) {
            balanceElement.className = 'info-value saldo-negativo';
        } else {
            balanceElement.className = 'info-value';
        }
    }

    recargar(cantidad: number): boolean {
        if (cantidad > 0) {
            this.balance += cantidad;
            this.mostrarInformacion();
            return true;
        }
        return false;
    }

    retirar(cantidad: number): boolean {
        if (cantidad > 0 && cantidad <= this.balance) {
            this.balance -= cantidad;
            this.mostrarInformacion();
            return true;
        }
        return false;
    }

    pagar(cantidad: number): boolean {
        if (cantidad > 0 && cantidad <= this.balance) {
            this.balance -= cantidad;
            this.mostrarInformacion();
            return true;
        }
        return false;
    }
}

const tarjetaEjemplo = new CreditCard(
    1,
    "Juan Carlos",
    "Pérez González",
    "4123-1235-1231-4132",
    123,
    "12/29",
    10000
);

tarjetas.push(tarjetaEjemplo);
tarjetaActual = tarjetaEjemplo;
actualizarSelectTarjetas();
tarjetaActual.mostrarInformacion();

function mostrarMensaje(elementId: string, mensaje: string, tipo: 'success' | 'error' = 'success'): void {
    const element = qs(elementId);
    element.innerHTML = `<div class="message ${tipo}">${mensaje}</div>`;
    setTimeout(() => {
        element.innerHTML = '';
    }, 3000);
}

function crearTarjeta(): void {
    const userId = parseInt(qs<HTMLInputElement>('newUserId').value);
    const firstName = qs<HTMLInputElement>('newFirstName').value;
    const lastName = qs<HTMLInputElement>('newLastName').value;
    const cardId = qs<HTMLInputElement>('newCardId').value;
    const cvv = parseInt(qs<HTMLInputElement>('newCvv').value);
    const expirationDate = qs<HTMLInputElement>('newExpirationDate').value;
    const balance = parseFloat(qs<HTMLInputElement>('newBalance').value) || 0;

    if (!userId || !firstName || !lastName || !cardId || !cvv || !expirationDate) {
        mostrarMensaje('createMessage', 'Por favor complete todos los campos', 'error');
        return;
    }

   
    const existeTarjeta = tarjetas.find(t => t.cardId === cardId);
    if (existeTarjeta) {
        mostrarMensaje('createMessage', 'Ya existe una tarjeta con ese ID', 'error');
        return;
    }

    const nuevaTarjeta = new CreditCard(userId, firstName, lastName, cardId, cvv, expirationDate, balance);
    tarjetas.push(nuevaTarjeta);
    tarjetaActual = nuevaTarjeta;
    
    actualizarSelectTarjetas();
    nuevaTarjeta.mostrarInformacion();
    
    
    qs<HTMLInputElement>('newUserId').value = '';
    qs<HTMLInputElement>('newFirstName').value = '';
    qs<HTMLInputElement>('newLastName').value = '';
    qs<HTMLInputElement>('newCardId').value = '';
    qs<HTMLInputElement>('newCvv').value = '';
    qs<HTMLInputElement>('newExpirationDate').value = '';
    qs<HTMLInputElement>('newBalance').value = '';

    mostrarMensaje('createMessage', 'Tarjeta creada exitosamente', 'success');
}

function recargarSaldo(): void {
    if (!tarjetaActual) {
        mostrarMensaje('rechargeMessage', 'No hay tarjeta seleccionada', 'error');
        return;
    }

    const cantidad = parseFloat(qs<HTMLInputElement>('rechargeAmount').value);
    
    if (isNaN(cantidad) || cantidad <= 0) {
        mostrarMensaje('rechargeMessage', 'Ingrese una cantidad válida', 'error');
        return;
    }

    tarjetaActual.recargar(cantidad);
    qs<HTMLInputElement>('rechargeAmount').value = '';
    mostrarMensaje('rechargeMessage', `Recarga exitosa de $${cantidad.toLocaleString()}`, 'success');
}

function retirarSaldo(): void {
    if (!tarjetaActual) {
        mostrarMensaje('retireMessage', 'No hay tarjeta seleccionada', 'error');
        return;
    }

    const cantidad = parseFloat(qs<HTMLInputElement>('retireAmount').value);
    
    if (isNaN(cantidad) || cantidad <= 0) {
        mostrarMensaje('retireMessage', 'Ingrese una cantidad válida', 'error');
        return;
    }

    if (cantidad > tarjetaActual.balance) {
        mostrarMensaje('retireMessage', 'Saldo insuficiente', 'error');
        return;
    }

    tarjetaActual.retirar(cantidad);
    qs<HTMLInputElement>('retireAmount').value = '';
    mostrarMensaje('retireMessage', `Retiro exitoso de $${cantidad.toLocaleString()}`, 'success');
}

function pagarConTarjeta(): void {
    if (!tarjetaActual) {
        mostrarMensaje('payMessage', 'No hay tarjeta seleccionada', 'error');
        return;
    }

    const cantidad = parseFloat(qs<HTMLInputElement>('payAmount').value);
    const descripcion = qs<HTMLInputElement>('payDescription').value;
    
    if (isNaN(cantidad) || cantidad <= 0) {
        mostrarMensaje('payMessage', 'Ingrese una cantidad válida', 'error');
        return;
    }

    if (cantidad > tarjetaActual.balance) {
        mostrarMensaje('payMessage', 'Saldo insuficiente', 'error');
        return;
    }

    tarjetaActual.pagar(cantidad);
    qs<HTMLInputElement>('payAmount').value = '';
    qs<HTMLInputElement>('payDescription').value = '';
    
    const mensajeDesc = descripcion ? ` - ${descripcion}` : '';
    mostrarMensaje('payMessage', `Pago exitoso de $${cantidad.toLocaleString()}${mensajeDesc}`, 'success');
}

function actualizarSelectTarjetas(): void {
    const select = qs<HTMLSelectElement>('cardSelect');
    select.innerHTML = '<option value="">Seleccione una tarjeta</option>';
    
    tarjetas.forEach((tarjeta, index) => {
        const option = document.createElement('option');
        option.value = String(index);
        option.textContent = `${tarjeta.cardId} - ${tarjeta.firstName} ${tarjeta.lastName}`;
        if (tarjeta === tarjetaActual) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

function elegirTarjeta(): void {
    const selectValue = qs<HTMLSelectElement>('cardSelect').value;
    
    if (selectValue === '') {
        mostrarMensaje('chooseMessage', 'Seleccione una tarjeta', 'error');
        return;
    }

    const index = parseInt(selectValue);
    tarjetaActual = tarjetas[index];
    tarjetaActual.mostrarInformacion();
    
    mostrarMensaje('chooseMessage', `Tarjeta seleccionada: ${tarjetaActual.cardId}`, 'success');
}


qs<HTMLInputElement>('newCardId').addEventListener('input', (e: Event) => {
    const input = e.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1-');
    input.value = value;
});

qs<HTMLInputElement>('newExpirationDate').addEventListener('input', (e: Event) => {
    const input = e.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
});
