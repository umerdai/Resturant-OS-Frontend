import { defineStore } from 'pinia';

export const usePaymentStore = defineStore('payment', {
    state: () => ({
        paymentMethods: {
            cash: {
                name: 'Cash',
                enabled: true,
                requiresChange: true,
                icon: 'pi pi-money-bill',
                color: '#22c55e'
            },
            card: {
                name: 'Credit/Debit Card',
                enabled: true,
                requiresAuth: true,
                icon: 'pi pi-credit-card',
                color: '#3b82f6'
            },
            digital_wallet: {
                name: 'Digital Wallet',
                enabled: true,
                requiresQR: true,
                icon: 'pi pi-mobile',
                color: '#8b5cf6'
            },
            check: {
                name: 'Check',
                enabled: true,
                requiresVerification: true,
                icon: 'pi pi-file-edit',
                color: '#f59e0b'
            },
            gift_card: {
                name: 'Gift Card',
                enabled: true,
                requiresValidation: true,
                icon: 'pi pi-gift',
                color: '#ec4899'
            },
            store_credit: {
                name: 'Store Credit',
                enabled: true,
                requiresCustomer: true,
                icon: 'pi pi-tag',
                color: '#06b6d4'
            },
            installment: {
                name: 'Installment Plan',
                enabled: true,
                requiresApproval: true,
                icon: 'pi pi-calendar',
                color: '#f97316'
            }
        },
        transactions: [],
        receipts: [],
        splitPayments: [],
        currentPayment: null,
        settings: {
            autoReceipt: true,
            emailReceipts: true,
            smsReceipts: false,
            printerEnabled: true,
            requireSignature: 50.0, // Amount threshold
            tipSuggestions: [15, 18, 20, 22],
            roundingEnabled: true,
            taxCalculation: 'inclusive'
        },
        paymentGateways: {
            stripe: {
                enabled: true,
                publicKey: 'pk_test_...',
                webhookUrl: '/webhooks/stripe'
            },
            paypal: {
                enabled: true,
                clientId: 'paypal_client_id',
                sandbox: true
            },
            square: {
                enabled: false,
                applicationId: 'square_app_id',
                locationId: 'square_location_id'
            }
        },
        printerSettings: {
            receiptPrinter: {
                name: 'Receipt Printer',
                ip: '192.168.1.100',
                port: 9100,
                enabled: true
            },
            kitchenPrinter: {
                name: 'Kitchen Printer',
                ip: '192.168.1.101',
                port: 9100,
                enabled: true
            }
        }
    }),

    getters: {
        // Get enabled payment methods
        enabledPaymentMethods: (state) => {
            return Object.entries(state.paymentMethods)
                .filter(([key, method]) => method.enabled)
                .map(([key, method]) => ({ id: key, ...method }));
        },

        // Get total transaction amount for today
        todayTotal: (state) => {
            const today = new Date().toISOString().split('T')[0];
            return state.transactions.filter((t) => t.date.startsWith(today) && t.status === 'completed').reduce((total, t) => total + t.amount, 0);
        },

        // Get transactions by payment method
        transactionsByMethod: (state) => {
            return state.transactions.reduce((acc, transaction) => {
                transaction.payments.forEach((payment) => {
                    if (!acc[payment.method]) acc[payment.method] = [];
                    acc[payment.method].push(transaction);
                });
                return acc;
            }, {});
        },

        // Get pending transactions
        pendingTransactions: (state) => {
            return state.transactions.filter((t) => t.status === 'pending');
        },

        // Get failed transactions
        failedTransactions: (state) => {
            return state.transactions.filter((t) => t.status === 'failed');
        }
    },

    actions: {
        // Initialize payment system
        async initializePayments() {
            try {
                await this.loadTransactions();
                await this.testPrinterConnections();
                return { success: true };
            } catch (error) {
                console.error('Failed to initialize payment system:', error);
                return { success: false, message: error.message };
            }
        },

        // Process single payment
        async processPayment(paymentData) {
            try {
                const { amount, method, orderId, customerId, tip = 0, metadata = {} } = paymentData;

                // Validate payment method
                if (!this.paymentMethods[method]?.enabled) {
                    throw new Error(`Payment method ${method} is not available`);
                }

                const transaction = {
                    id: `TXN${Date.now()}`,
                    orderId,
                    customerId,
                    amount: parseFloat(amount),
                    tip: parseFloat(tip),
                    total: parseFloat(amount) + parseFloat(tip),
                    method,
                    status: 'processing',
                    date: new Date().toISOString(),
                    payments: [
                        {
                            method,
                            amount: parseFloat(amount) + parseFloat(tip),
                            status: 'processing',
                            reference: null
                        }
                    ],
                    metadata
                };

                this.transactions.unshift(transaction);
                this.currentPayment = transaction;

                // Process based on payment method
                let result;
                switch (method) {
                    case 'cash':
                        result = await this.processCashPayment(transaction, paymentData);
                        break;
                    case 'card':
                        result = await this.processCardPayment(transaction, paymentData);
                        break;
                    case 'digital_wallet':
                        result = await this.processDigitalWalletPayment(transaction, paymentData);
                        break;
                    case 'gift_card':
                        result = await this.processGiftCardPayment(transaction, paymentData);
                        break;
                    default:
                        result = await this.processGenericPayment(transaction, paymentData);
                }

                if (result.success) {
                    transaction.status = 'completed';
                    transaction.payments[0].status = 'completed';
                    transaction.payments[0].reference = result.reference;

                    // Generate receipt
                    if (this.settings.autoReceipt) {
                        await this.generateReceipt(transaction);
                    }
                } else {
                    transaction.status = 'failed';
                    transaction.payments[0].status = 'failed';
                    transaction.error = result.error;
                }

                return result;
            } catch (error) {
                console.error('Payment processing error:', error);
                return { success: false, error: error.message };
            }
        },

        // Process split payment
        async processSplitPayment(splitData) {
            try {
                const { orderId, customerId, totalAmount, payments, tip = 0 } = splitData;

                // Validate split totals
                const splitTotal = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
                if (Math.abs(splitTotal - parseFloat(totalAmount)) > 0.01) {
                    throw new Error('Split payment amounts do not match order total');
                }

                const transaction = {
                    id: `TXN${Date.now()}`,
                    orderId,
                    customerId,
                    amount: parseFloat(totalAmount),
                    tip: parseFloat(tip),
                    total: parseFloat(totalAmount) + parseFloat(tip),
                    method: 'split',
                    status: 'processing',
                    date: new Date().toISOString(),
                    payments: payments.map((p, index) => ({
                        id: `PAY${Date.now()}_${index}`,
                        method: p.method,
                        amount: parseFloat(p.amount),
                        status: 'pending',
                        reference: null,
                        metadata: p.metadata || {}
                    })),
                    metadata: { split: true }
                };

                this.transactions.unshift(transaction);
                this.currentPayment = transaction;

                // Process each payment separately
                const results = [];
                for (let i = 0; i < transaction.payments.length; i++) {
                    const payment = transaction.payments[i];

                    const paymentResult = await this.processPayment({
                        amount: payment.amount,
                        method: payment.method,
                        orderId,
                        customerId,
                        tip: i === 0 ? tip : 0, // Only add tip to first payment
                        metadata: { ...payment.metadata, splitIndex: i, splitTotal: payments.length }
                    });

                    payment.status = paymentResult.success ? 'completed' : 'failed';
                    payment.reference = paymentResult.reference;
                    if (!paymentResult.success) {
                        payment.error = paymentResult.error;
                    }

                    results.push(paymentResult);
                }

                // Determine overall transaction status
                const allSuccessful = results.every((r) => r.success);
                const anySuccessful = results.some((r) => r.success);

                if (allSuccessful) {
                    transaction.status = 'completed';
                } else if (anySuccessful) {
                    transaction.status = 'partial';
                } else {
                    transaction.status = 'failed';
                }

                // Generate receipt for completed transactions
                if (transaction.status === 'completed' && this.settings.autoReceipt) {
                    await this.generateReceipt(transaction);
                }

                return {
                    success: allSuccessful,
                    transaction,
                    results,
                    message: allSuccessful ? 'All payments processed successfully' : anySuccessful ? 'Some payments failed. Please retry failed payments.' : 'All payments failed'
                };
            } catch (error) {
                console.error('Split payment error:', error);
                return { success: false, error: error.message };
            }
        },

        // Process cash payment
        async processCashPayment(transaction, paymentData) {
            const { cashReceived } = paymentData;
            const change = parseFloat(cashReceived) - transaction.total;

            if (change < 0) {
                return {
                    success: false,
                    error: 'Insufficient cash received'
                };
            }

            return {
                success: true,
                reference: `CASH${Date.now()}`,
                change: change,
                message: `Cash payment processed. Change: $${change.toFixed(2)}`
            };
        },

        // Process card payment
        async processCardPayment(transaction, paymentData) {
            try {
                // Simulate card processing with payment gateway
                const gateway = this.paymentGateways.stripe;

                if (!gateway.enabled) {
                    throw new Error('Card payment gateway is disabled');
                }

                // Simulate API call to payment processor
                const response = await this.simulateCardProcessing({
                    amount: transaction.total,
                    currency: 'USD',
                    description: `Order #${transaction.orderId}`,
                    metadata: {
                        orderId: transaction.orderId,
                        customerId: transaction.customerId
                    }
                });

                return {
                    success: response.success,
                    reference: response.transactionId,
                    authCode: response.authCode,
                    last4: response.last4,
                    message: response.success ? 'Card payment processed successfully' : response.error
                };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },

        // Process digital wallet payment
        async processDigitalWalletPayment(transaction, paymentData) {
            try {
                const { walletType } = paymentData; // apple_pay, google_pay, etc.

                // Simulate digital wallet processing
                const response = await this.simulateDigitalWalletProcessing({
                    amount: transaction.total,
                    walletType,
                    orderId: transaction.orderId
                });

                return {
                    success: response.success,
                    reference: response.transactionId,
                    walletType: walletType,
                    message: response.success ? `${walletType} payment processed successfully` : response.error
                };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },

        // Process gift card payment
        async processGiftCardPayment(transaction, paymentData) {
            try {
                const { giftCardNumber, pin } = paymentData;

                // Simulate gift card validation and processing
                const response = await this.simulateGiftCardProcessing({
                    cardNumber: giftCardNumber,
                    pin: pin,
                    amount: transaction.total
                });

                return {
                    success: response.success,
                    reference: response.transactionId,
                    remainingBalance: response.remainingBalance,
                    message: response.success ? 'Gift card payment processed successfully' : response.error
                };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },

        // Process generic payment (check, store credit, etc.)
        async processGenericPayment(transaction, paymentData) {
            return {
                success: true,
                reference: `GEN${Date.now()}`,
                message: `${transaction.method} payment processed successfully`
            };
        },

        // Generate receipt
        async generateReceipt(transaction) {
            try {
                const receipt = {
                    id: `RCP${Date.now()}`,
                    transactionId: transaction.id,
                    orderId: transaction.orderId,
                    date: new Date().toISOString(),
                    items: transaction.metadata.items || [],
                    subtotal: transaction.amount,
                    tip: transaction.tip,
                    tax: transaction.metadata.tax || 0,
                    total: transaction.total,
                    payments: transaction.payments,
                    customer: transaction.metadata.customer || {},
                    restaurant: {
                        name: 'Restaurant Name',
                        address: '123 Main St',
                        phone: '(555) 123-4567',
                        email: 'info@restaurant.com'
                    }
                };

                this.receipts.unshift(receipt);

                // Print receipt if enabled
                if (this.settings.printerEnabled) {
                    await this.printReceipt(receipt);
                }

                // Email receipt if enabled and customer email available
                if (this.settings.emailReceipts && receipt.customer.email) {
                    await this.emailReceipt(receipt);
                }

                // SMS receipt if enabled and customer phone available
                if (this.settings.smsReceipts && receipt.customer.phone) {
                    await this.smsReceipt(receipt);
                }

                return { success: true, receipt };
            } catch (error) {
                console.error('Receipt generation error:', error);
                return { success: false, error: error.message };
            }
        },

        // Print receipt
        async printReceipt(receipt) {
            try {
                const printer = this.printerSettings.receiptPrinter;
                if (!printer.enabled) return;

                // Generate receipt text
                const receiptText = this.formatReceiptText(receipt);

                // Simulate printer communication
                console.log('Printing receipt:', receiptText);

                return { success: true };
            } catch (error) {
                console.error('Print error:', error);
                return { success: false, error: error.message };
            }
        },

        // Email receipt
        async emailReceipt(receipt) {
            try {
                const emailData = {
                    to: receipt.customer.email,
                    subject: `Receipt - Order #${receipt.orderId}`,
                    template: 'receipt',
                    data: receipt
                };

                // Simulate email sending
                console.log('Sending email receipt:', emailData);

                return { success: true };
            } catch (error) {
                console.error('Email error:', error);
                return { success: false, error: error.message };
            }
        },

        // SMS receipt
        async smsReceipt(receipt) {
            try {
                const smsData = {
                    to: receipt.customer.phone,
                    message: `Thank you for your order! Receipt #${receipt.id}. Total: $${receipt.total.toFixed(2)}. View details: ${receipt.viewUrl}`
                };

                // Simulate SMS sending
                console.log('Sending SMS receipt:', smsData);

                return { success: true };
            } catch (error) {
                console.error('SMS error:', error);
                return { success: false, error: error.message };
            }
        },

        // Format receipt text for printing
        formatReceiptText(receipt) {
            let text = '';
            text += `${receipt.restaurant.name}\n`;
            text += `${receipt.restaurant.address}\n`;
            text += `${receipt.restaurant.phone}\n`;
            text += '================================\n';
            text += `Receipt #: ${receipt.id}\n`;
            text += `Order #: ${receipt.orderId}\n`;
            text += `Date: ${new Date(receipt.date).toLocaleString()}\n`;
            text += '================================\n';

            // Items
            receipt.items.forEach((item) => {
                text += `${item.name} x${item.quantity}\n`;
                text += `  $${item.price.toFixed(2)}\n`;
            });

            text += '================================\n';
            text += `Subtotal: $${receipt.subtotal.toFixed(2)}\n`;
            text += `Tax: $${receipt.tax.toFixed(2)}\n`;
            text += `Tip: $${receipt.tip.toFixed(2)}\n`;
            text += `Total: $${receipt.total.toFixed(2)}\n`;
            text += '================================\n';

            // Payment methods
            receipt.payments.forEach((payment) => {
                text += `${payment.method}: $${payment.amount.toFixed(2)}\n`;
            });

            text += '================================\n';
            text += 'Thank you for your business!\n';

            return text;
        },

        // Simulate payment processing
        async simulateCardProcessing(data) {
            // Simulate network delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Simulate 95% success rate
            if (Math.random() > 0.05) {
                return {
                    success: true,
                    transactionId: `card_${Date.now()}`,
                    authCode: `AUTH${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                    last4: '1234'
                };
            } else {
                return {
                    success: false,
                    error: 'Card declined'
                };
            }
        },

        async simulateDigitalWalletProcessing(data) {
            await new Promise((resolve) => setTimeout(resolve, 800));

            if (Math.random() > 0.03) {
                return {
                    success: true,
                    transactionId: `wallet_${Date.now()}`
                };
            } else {
                return {
                    success: false,
                    error: 'Digital wallet payment failed'
                };
            }
        },

        async simulateGiftCardProcessing(data) {
            await new Promise((resolve) => setTimeout(resolve, 600));

            const mockBalance = 50.0;
            if (data.amount <= mockBalance) {
                return {
                    success: true,
                    transactionId: `gift_${Date.now()}`,
                    remainingBalance: mockBalance - data.amount
                };
            } else {
                return {
                    success: false,
                    error: 'Insufficient gift card balance'
                };
            }
        },

        // Load transactions
        async loadTransactions() {
            try {
                // Simulate loading transactions from API
                // In real implementation, fetch from backend
                this.transactions = [];
                return { success: true };
            } catch (error) {
                throw error;
            }
        },

        // Test printer connections
        async testPrinterConnections() {
            try {
                // Simulate testing printer connections
                console.log('Testing printer connections...');
                return { success: true };
            } catch (error) {
                console.error('Printer test failed:', error);
                return { success: false, error: error.message };
            }
        },

        // Refund payment
        async refundPayment(transactionId, amount = null) {
            try {
                const transaction = this.transactions.find((t) => t.id === transactionId);
                if (!transaction) throw new Error('Transaction not found');

                const refundAmount = amount || transaction.total;

                // Create refund transaction
                const refund = {
                    id: `RFD${Date.now()}`,
                    originalTransactionId: transactionId,
                    amount: refundAmount,
                    status: 'processing',
                    date: new Date().toISOString(),
                    reason: 'Customer refund request'
                };

                // Process refund based on original payment method
                // Simulate refund processing
                await new Promise((resolve) => setTimeout(resolve, 1000));

                refund.status = 'completed';
                transaction.refunded = true;
                transaction.refundAmount = refundAmount;

                return { success: true, refund };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },

        // Update payment settings
        updatePaymentSettings(settings) {
            this.settings = { ...this.settings, ...settings };
        },

        // Toggle payment method
        togglePaymentMethod(method, enabled) {
            if (this.paymentMethods[method]) {
                this.paymentMethods[method].enabled = enabled;
            }
        }
    }
});
