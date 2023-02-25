import { basketInfo, basketOrderLines, basketDeliveryAddress, basketInvoiceAddress } from './basket';

/**
 * Constructs JSON API representation of the current basket with all
 * content included, assuming this basket exists.
 */
async function basketJsonApi( uuid, sessionId ) {
  const basket = await basketInfo(uuid, sessionId);
  const orderLines = await basketOrderLines( uuid, sessionId );
  const deliveryAddress = await basketDeliveryAddress( uuid, sessionId );
  const invoiceAddress = await basketInvoiceAddress( uuid, sessionId );

  return {
    data: [{
      type: "baskets",
      id: uuid,
      attributes: {
        "order-status": basket.orderStatus,
        "payment-status": basket.paymentStatus,
        "has-custom-delivery-place": basket.hasCustomDeliveryPlace,
        "delivery-type": basket.deliveryType,
        "changed-at": basket.changedAt
      },
      relationships: {
        "order-lines": {
          links: {}, // None available
          data: orderLines.map((ol) => ({
            type: "order-lines",
            id: ol.uuid
          }))
        },
        "delivery-place": {
          links: {}, // None available
          data: {
            type: "delivery-place",
            id: basket.deliveryPlaceUuid || null
          }
        },
        "delivery-address": {
          links: {}, // None available
          data: {
            type: "full-addresses",
            id: deliveryAddress ? deliveryAddress.uuid : null
          }
        },
        "invoice-address": {
          links: {}, // None available
          data: {
            type: "full-addresses",
            id: invoiceAddress ? invoiceAddress.uuid : null
          }
        },
      }
    }],
    links: {}, // None available
    meta: {}, // None available
    included: [
      // list all included resources with their details and expansion

      // orderLines
      ...orderLines.map( (ol) => (
        {
          id: ol.uuid,
          type: "order-lines",
          attributes: {
            amount: ol.amount
          },
          relationships: {
            offering: {
              links: { }, // None available
              data: {
                type: "offerings",
                id: ol.offeringUuid
              }
            }
          }
        })),
      // deliveryAddress
      ...deliveryAddress ?
        [{
          id: deliveryAddress.uuid,
          type: "full-addresses",
          attributes: {
            name: deliveryAddress.name,
            company: deliveryAddress.company,
            telephone: deliveryAddress.telephone,
            email: deliveryAddress.email
          },
          relationships: {
            "postal-address": {
              links: {}, // None available
              data: deliveryAddress.postalAddressUuid
                ? { type: "postal-addresses", id: deliveryAddress.postalAddressUuid }
                : null
            }
          }
        }]
        : [],
      ...(deliveryAddress && deliveryAddress.postalAddressUuid ?
        [{
          id: deliveryAddress.postalAddressUuid,
          type: "postal-addresses",
          attributes: {
            "locality": deliveryAddress.postalLocality,
            "postal-code": deliveryAddress.postalCode,
            "street-address": deliveryAddress.streetAddress
          }
        }]
          : []),
      // invoiceAddress
      ...invoiceAddress ?
        [{
          id: invoiceAddress.uuid,
          type: "full-addresses",
          attributes: {
            name: invoiceAddress.name,
            company: invoiceAddress.company,
            telephone: invoiceAddress.telephone,
            email: invoiceAddress.email
          },
          relationships: {
            "postal-address": {
              links: {}, // None available
              data: invoiceAddress.postalAddressUuid
                ? { type: "postal-addresses", id: invoiceAddress.postalAddressUuid }
                : null
            }
          }
        }]
        : [],
      ...(invoiceAddress && invoiceAddress.postalAddressUuid ?
        [{
          id: invoiceAddress.postalAddressUuid,
          type: "postal-addresses",
          attributes: {
            "locality": invoiceAddress.postalLocality,
            "postal-code": invoiceAddress.postalCode,
            "street-address": invoiceAddress.streetAddress
          }
        }]
          : [])
    ]
  };
}

export { basketJsonApi };