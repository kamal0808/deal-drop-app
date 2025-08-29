export interface CouponOffer {
  id: string;
  type: 'percentage' | 'bogo' | 'flat' | 'cashback';
  title: string;
  description: string;
  couponCode: string;
  expiryDate: string;
  backgroundColor: string;
  textColor: string;
  iconColor: string;
}

export const mockCoupons: CouponOffer[] = [
  {
    id: 'coupon-1',
    type: 'percentage',
    title: 'Flat 30% OFF',
    description: 'On all fashion items',
    couponCode: 'LOCALITHNM30',
    expiryDate: '2024-12-31',
    backgroundColor: 'from-purple-500 to-pink-500',
    textColor: 'text-white',
    iconColor: 'text-yellow-300'
  },
  {
    id: 'coupon-2',
    type: 'bogo',
    title: 'Buy 1 Get 1',
    description: 'On selected food items',
    couponCode: 'LOCALITHELIOS1TO1',
    expiryDate: '2024-11-30',
    backgroundColor: 'from-green-500 to-teal-500',
    textColor: 'text-white',
    iconColor: 'text-yellow-300'
  },
  {
    id: 'coupon-3',
    type: 'flat',
    title: '₹200 OFF',
    description: 'On orders above ₹999',
    couponCode: 'LOCALITSAVE200',
    expiryDate: '2024-12-15',
    backgroundColor: 'from-orange-500 to-red-500',
    textColor: 'text-white',
    iconColor: 'text-yellow-300'
  },
  {
    id: 'coupon-4',
    type: 'percentage',
    title: 'Flat 25% OFF',
    description: 'On electronics & gadgets',
    couponCode: 'LOCALITTECH25',
    expiryDate: '2024-12-20',
    backgroundColor: 'from-blue-500 to-indigo-500',
    textColor: 'text-white',
    iconColor: 'text-yellow-300'
  },
  {
    id: 'coupon-5',
    type: 'cashback',
    title: '15% Cashback',
    description: 'Up to ₹500 cashback',
    couponCode: 'LOCALITCASH15',
    expiryDate: '2024-11-25',
    backgroundColor: 'from-emerald-500 to-cyan-500',
    textColor: 'text-white',
    iconColor: 'text-yellow-300'
  },
  {
    id: 'coupon-6',
    type: 'bogo',
    title: 'Buy 2 Get 1',
    description: 'On beauty products',
    couponCode: 'LOCALITBEAUTY2TO1',
    expiryDate: '2024-12-10',
    backgroundColor: 'from-pink-500 to-rose-500',
    textColor: 'text-white',
    iconColor: 'text-yellow-300'
  },
  {
    id: 'coupon-7',
    type: 'flat',
    title: '₹100 OFF',
    description: 'On first order',
    couponCode: 'LOCALITFIRST100',
    expiryDate: '2024-12-31',
    backgroundColor: 'from-violet-500 to-purple-500',
    textColor: 'text-white',
    iconColor: 'text-yellow-300'
  },
  {
    id: 'coupon-8',
    type: 'percentage',
    title: 'Flat 40% OFF',
    description: 'On home & kitchen',
    couponCode: 'LOCALITHOME40',
    expiryDate: '2024-11-28',
    backgroundColor: 'from-amber-500 to-orange-500',
    textColor: 'text-white',
    iconColor: 'text-yellow-300'
  },
  {
    id: 'coupon-9',
    type: 'cashback',
    title: '20% Cashback',
    description: 'Up to ₹1000 cashback',
    couponCode: 'LOCALITSUPER20',
    expiryDate: '2024-12-05',
    backgroundColor: 'from-teal-500 to-green-500',
    textColor: 'text-white',
    iconColor: 'text-yellow-300'
  },
  {
    id: 'coupon-10',
    type: 'bogo',
    title: 'Buy 1 Get 1',
    description: 'On books & stationery',
    couponCode: 'LOCALITBOOKS1TO1',
    expiryDate: '2024-12-18',
    backgroundColor: 'from-indigo-500 to-blue-500',
    textColor: 'text-white',
    iconColor: 'text-yellow-300'
  }
];

// Function to get a random coupon
export const getRandomCoupon = (): CouponOffer => {
  const randomIndex = Math.floor(Math.random() * mockCoupons.length);
  return mockCoupons[randomIndex];
};

// Function to format expiry date
export const formatExpiryDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};
