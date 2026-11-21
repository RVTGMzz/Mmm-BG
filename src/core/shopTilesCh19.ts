import type { BoardNode } from './types';

/**
 * CH-19 shop tiles: six board tiles belong to a building drawn right beside
 * them. Landing exactly on one draws a random event from that shop (host RNG,
 * so replays and online stay deterministic). One shop, several stories.
 */

export type ShopEventCh19 = {
  id: string;
  title: string;
  description: string;
  amount: number;
  weight: number;
};

export type ShopDefinitionCh19 = {
  contentId: string;
  name: string;
  icon: string;
  /** island prop drawn beside the tile */
  building: string;
  colour: string;
  events: readonly ShopEventCh19[];
};

export const SHOPS_CH19: readonly ShopDefinitionCh19[] = [
  {
    contentId: 'SHOP_FLOWER', name: 'TIỆM HOA', icon: '🌸', building: 'shop-pink', colour: '#F06FA5',
    events: [
      { id: 'flower-100th', title: 'KHÁCH THỨ 100!', description: 'Bạn là khách thứ 100 trong ngày, tiệm tặng thưởng tri ân.', amount: 30, weight: 3 },
      { id: 'flower-allergy', title: 'DỊ ỨNG PHẤN HOA', description: 'Hắt xì liên tục, phải ghé nhà thuốc mua thuốc dị ứng.', amount: -25, weight: 3 },
      { id: 'flower-crush', title: 'BÓ HOA TẶNG CRUSH', description: 'Mua bó hồng thật to… crush đã có người yêu.', amount: -15, weight: 2 },
      { id: 'flower-orchid', title: 'BÁN GIÙM CHẬU LAN', description: 'Bán giùm chủ tiệm chậu lan quý, được chia hoa hồng.', amount: 20, weight: 2 },
    ],
  },
  {
    contentId: 'SHOP_BAKERY', name: 'TIỆM BÁNH', icon: '🥐', building: 'bakery', colour: '#E89A3C',
    events: [
      { id: 'bakery-lucky', title: 'BÁNH MAY MẮN', description: 'Cắn trúng đồng xu trong bánh, được thưởng như lệ của tiệm.', amount: 25, weight: 3 },
      { id: 'bakery-tummy', title: 'ĂN QUÁ NO', description: 'Thử hết mười loại bánh, đau bụng phải mua men tiêu hóa.', amount: -20, weight: 3 },
      { id: 'bakery-help', title: 'PHỤ NHÀO BỘT', description: 'Tiệm đông khách, bạn phụ một tay và được trả công.', amount: 20, weight: 2 },
      { id: 'bakery-cake', title: 'BÁNH KEM SINH NHẬT', description: 'Chợt nhớ ra hôm nay sinh nhật bạn thân, mua vội bánh kem.', amount: -15, weight: 2 },
    ],
  },
  {
    contentId: 'SHOP_CAFE', name: 'QUÁN CÀ PHÊ', icon: '☕', building: 'cafe', colour: '#9C6B45',
    events: [
      { id: 'cafe-investor', title: 'GẶP NHÀ ĐẦU TƯ', description: 'Ngồi nhầm bàn, ai ngờ gặp nhà đầu tư thích ý tưởng của bạn.', amount: 35, weight: 2 },
      { id: 'cafe-spill', title: 'ĐỔ CÀ PHÊ LÊN LAPTOP', description: 'Một ly bạc xỉu và chiếc laptop… tiền sửa không hề nhẹ.', amount: -30, weight: 2 },
      { id: 'cafe-viral', title: 'CHECK-IN VIRAL', description: 'Tấm ảnh sống ảo nổi rần rần, quán trả tiền quảng cáo.', amount: 20, weight: 3 },
      { id: 'cafe-treat', title: 'BAO CẢ QUÁN', description: 'Lỡ miệng nói "để mình trả" khi cả nhóm bạn đang ở đó.', amount: -20, weight: 3 },
    ],
  },
  {
    contentId: 'SHOP_STORE', name: 'CỬA HÀNG TIỆN LỢI', icon: '🏪', building: 'store', colour: '#3DBA5C',
    events: [
      { id: 'store-scratch', title: 'VÉ CÀO TRÚNG THƯỞNG', description: 'Mua chai nước được tặng vé cào, cào ra trúng thật!', amount: 30, weight: 2 },
      { id: 'store-splurge', title: 'MUA QUÁ TAY', description: 'Vào mua gói mì, ra về với nguyên giỏ đồ ăn vặt.', amount: -20, weight: 3 },
      { id: 'store-wallet', title: 'NHẶT ĐƯỢC VÍ', description: 'Trả lại chiếc ví đánh rơi, chủ ví hậu tạ.', amount: 25, weight: 2 },
      { id: 'store-forgot', title: 'QUÊN VÍ Ở NHÀ', description: 'Tính tiền xong mới nhớ quên ví, phải chạy về rồi mua lại.', amount: -15, weight: 3 },
    ],
  },
  {
    contentId: 'SHOP_OFFICE', name: 'TÒA VĂN PHÒNG', icon: '🏢', building: 'tower-glass', colour: '#5B8DEF',
    events: [
      { id: 'office-contract', title: 'KÝ HỢP ĐỒNG', description: 'Đi ngang phòng họp, được mời vào chốt deal giùm.', amount: 40, weight: 2 },
      { id: 'office-elevator', title: 'KẸT THANG MÁY', description: 'Kẹt thang máy 30 phút, trễ hẹn mất luôn khách hàng.', amount: -30, weight: 2 },
      { id: 'office-overtime', title: 'TĂNG CA', description: 'Làm thêm giờ buổi tối, nhận tiền tăng ca.', amount: 20, weight: 3 },
      { id: 'office-parking', title: 'PHÍ GỬI XE', description: 'Gửi xe ở tòa nhà tính tiền theo giờ… và theo phút.', amount: -10, weight: 3 },
    ],
  },
  {
    contentId: 'SHOP_APARTMENT', name: 'CHUNG CƯ', icon: '🏠', building: 'apartment', colour: '#B07CD8',
    events: [
      { id: 'apartment-gift', title: 'HÀNG XÓM TẶNG QUÀ', description: 'Cô hàng xóm đi du lịch về, mang quà biếu cả tầng.', amount: 20, weight: 3 },
      { id: 'apartment-power', title: 'TIỀN ĐIỆN TĂNG VỌT', description: 'Máy lạnh chạy cả tháng, hóa đơn điện gửi tới tận tay.', amount: -25, weight: 3 },
      { id: 'apartment-rent', title: 'CHO THUÊ PHÒNG', description: 'Cho thuê căn phòng trống, nhận tiền cọc tháng đầu.', amount: 30, weight: 2 },
      { id: 'apartment-pipe', title: 'VỠ ỐNG NƯỚC', description: 'Ống nước vỡ lúc nửa đêm, gọi thợ sửa gấp.', amount: -20, weight: 2 },
    ],
  },
];

const BY_CONTENT = new Map(SHOPS_CH19.map((shop) => [shop.contentId, shop]));

export function shopForNodeCh19(node: Pick<BoardNode, 'contentId'> | undefined): ShopDefinitionCh19 | undefined {
  return node?.contentId ? BY_CONTENT.get(node.contentId) : undefined;
}

export function isShopContentCh19(contentId: string | undefined): boolean {
  return Boolean(contentId && BY_CONTENT.has(contentId));
}

/** Weighted pick from one host random number in [0, 1). */
export function pickShopEventCh19(shop: ShopDefinitionCh19, random: number): ShopEventCh19 {
  const total = shop.events.reduce((sum, event) => sum + event.weight, 0);
  let r = Math.max(0, Math.min(0.999999, random)) * total;
  for (const event of shop.events) {
    r -= event.weight;
    if (r < 0) return event;
  }
  return shop.events[shop.events.length - 1];
}
