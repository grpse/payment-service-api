#!/usr/local/bin/node
'use strict';

const { Pool } = require('pg');
const pagarme = require('pagarme');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    statement_timeout: (process.env.STATEMENT_TIMEOUT || 5000)
});

async function subscriptions_charge() {
    try {
        // fetch payment and user data to build context
        const res = await pool.query(
            `select payment_service.subscriptions_charge()`);

        console.log(res.rows[0]);
    } catch (e) {
        console.log(e);
    };
};

async function subscriptions_gateway_error_rescue_charge() {
    try {
        // fetch payment and user data to build context
        const res = await pool.query(
            `select payment_service.subscriptions_server_error_rescue_charge()`);

        console.log(res.rows[0]);
    } catch (e) {
        console.log(e);
    };
};

async function refuse_expired_slip_payments() {
    try {
        // fetch payment and user data to build context
        const res = await pool.query(
            `select payment_service.refuse_expired_slip_payments()`);

        console.log(res.rows[0]);
    } catch (e) {
        console.log(e);
    };
};

async function cancel_canceling_expired_subscriptions() {
    try {
        // fetch payment and user data to build context
        const res = await pool.query(
            `select payment_service.cancel_subscriptions()`);

        console.log(res.rows[0]);
    } catch (e) {
        console.log(e);
    };
};

const recursive_calls = () => {

    const rec_charge = () => {
        setTimeout(() => {
            console.log('checking for subscriptions to charge');

            subscriptions_charge().then(() => {
                rec_charge();
            })
        }, (process.env.SET_INTERVAL || 60000));
    };

    const rec_errors_charge = () => {
        setTimeout(() => {
            console.log('checking for subscriptions gateway errors to charge');
            subscriptions_gateway_error_rescue_charge().then(() => {
                rec_errors_charge();
            });
        }, (process.env.SET_INTERVAL || 60000));
    };

    const refuse_expired = () => {
        setTimeout(() => {
            console.log('checking for expired slip payments');
            refuse_expired_slip_payments().then(() => {
                refuse_expired();
            });
        }, (process.env.SET_INTERVAL || 60000));
    }

    const cancel_expired_subscriptions = () => {
        setTimeout(() => {
            console.log('checking for expired canceling subscriptions');
            cancel_canceling_expired_subscriptions().then(() => {
                cancel_expired_subscriptions();
            });
        }, (process.env.SET_INTERVAL || 60000));
    }

    rec_charge();
    rec_errors_charge();
    refuse_expired();
    cancel_expired_subscriptions();
};

recursive_calls();
