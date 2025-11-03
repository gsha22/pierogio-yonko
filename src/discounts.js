// ...existing code...
function discounts(order, profile, couponCode = null) {
  let totalDiscount = 0;
  
  // Volume pricing discounts
  const volumeDiscounts = {
    'guest': { 12: 0.05, 24: 0.10 },
    'regular': { 12: 0.08, 24: 0.12 },
    'vip': { 12: 0.05, 24: 0.10 }
  };
  
  const tierDiscounts = volumeDiscounts[profile.tier] || volumeDiscounts['guest'];
  
  for (const item of order.items) {
    let itemSubtotal = item.unitPriceCents * item.qty;
    
    // Apply volume discount based on quantity
    if (item.qty >= 24 && tierDiscounts[24]) {
      totalDiscount += Math.floor(itemSubtotal * tierDiscounts[24]);
    } else if (item.qty >= 12 && tierDiscounts[12]) {
      totalDiscount += Math.floor(itemSubtotal * tierDiscounts[12]);
    }
  }
  
  // Coupon discounts
  if (couponCode) {
    const couponDiscount = applyCoupon(couponCode, order);
    totalDiscount += couponDiscount;
  }
  
  // Ensure discount is an integer, non-negative and does not exceed order subtotal
  const orderSubtotal = order.items.reduce((s, it) => s + it.unitPriceCents * it.qty, 0);
  totalDiscount = Math.floor(totalDiscount);
  totalDiscount = Math.max(0, Math.min(totalDiscount, orderSubtotal));
  
  return totalDiscount;
}
// ...existing code...
function applyCoupon(code, order) {
  if (code === 'PIEROGI-BOGO') {
    let discount = 0;
    let firstSixPack = null;
    
    for (const item of order.items) {
      if (item.qty === 6) {
        if (!firstSixPack) {
          firstSixPack = item;
        } else {
          discount += Math.floor(item.unitPriceCents * item.qty * 0.5);
          break;
        }
      }
    }
    
    return discount;
  }
  
  if (code === 'FIRST10') {
    // FIRST10: give 10% off the order subtotal (never negative)
    const pct = 0.10;
    let subtotal = 0;
    for (const item of order.items) {
      subtotal += item.unitPriceCents * item.qty;
    }
    const discountAmount = Math.floor(subtotal * pct);
    return Math.max(0, discountAmount);
  }
  
  return 0;
}
// ...existing code...
module.exports = { discounts };