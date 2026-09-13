export interface TileIdentityCopy {
  title: string;
  impact: string;
  description: string;
  holdMs: number;
}

const NODE_COPY: Record<number, Omit<TileIdentityCopy, 'holdMs'>> = {
  0: { title: 'QUẢNG TRƯỜNG READY', impact: '🏁', description: 'Điểm xuất phát của một vòng mới.' },
  1: { title: 'HẺM CÀ PHÊ', impact: '☕', description: 'Mùi cà phê thơm phức. Không có biến cố, chỉ hơi muốn ngồi lại.' },
  2: { title: 'LỘC VỈA HÈ', impact: '💰', description: 'Một khoản tiền nhỏ nằm đúng chỗ người có duyên đi ngang.' },
  3: { title: 'TIỆM BÀI BÍ ẨN', impact: '🃏', description: 'Cánh cửa mở hé. Một Lá Bài đang chờ được rút.' },
  4: { title: 'NGÃ TƯ ĐÔNG NGHẸT', impact: '🚦', description: 'Đèn vừa xanh. Đi tiếp trước khi thành phố đổi ý.' },
  5: { title: 'BẢNG TIN PHỐ CHÍNH', impact: '📰', description: 'Tin mới vừa được dán lên. Thành phố sắp có biến.' },
  6: { title: 'VÒNG XOAY', impact: '🔄', description: 'Một vòng cua sạch sẽ. Không mất tiền, không mất mặt.' },
  7: { title: 'PHÍ GỬI XE', impact: '💸', description: 'Có những nơi vào miễn phí, nhưng ra thì không.' },
  8: { title: 'MÁY GACHA LÁ BÀI', impact: '🃏', description: 'Máy kêu một tiếng “ting”. Hy vọng không phải đồ trùng.' },
  9: { title: 'QUÁN VỈA HÈ', impact: '🥤', description: 'Tạm nghỉ một nhịp. Thành phố hôm nay khá hiền.' },
  10: { title: 'TIN NÓNG KHU NAM', impact: '📰', description: 'Một bản tin mới vừa chen ngang cuộc vui.' },
  11: { title: 'LÌ XÌ BẤT NGỜ', impact: '🧧', description: 'Không rõ ai gửi, nhưng tiền thật thì cứ nhận.' },
  12: { title: 'CÔNG VIÊN', impact: '🌳', description: 'Gió mát, ghế trống, không drama. Hiếm có.' },
  13: { title: 'CHỢ ĐÊM LÁ BÀI', impact: '🃏', description: 'Một quầy hàng kỳ lạ đang phát Lá Bài miễn phí.' },
  14: { title: 'CẦU ĐI BỘ', impact: '🌉', description: 'Qua cầu bình yên. Phía trước chưa chắc.' },
  15: { title: 'LOA PHƯỜNG', impact: '📢', description: 'Một thông báo đủ lớn để cả khu phố cùng biết.' },
  16: { title: 'TIỀN RƠI GÓC PHỐ', impact: '🪙', description: 'Có người đánh rơi tiền. Thành phố quyết định đó là bạn.' },
  17: { title: 'GÓC PHỐ YÊN BÌNH', impact: '🌙', description: 'Không ai gọi tên bạn. Một ô bình yên đáng quý.' },
  18: { title: 'HẺM TẮT', impact: '🛵', description: 'Đường hẹp nhưng lẹ. Chẵn thì đời cho đi đường tắt.' },
  19: { title: 'LỐI TẮT SAU CHỢ', impact: '🏃', description: 'Sắp nhập lại phố chính. Đi nhanh kẻo bị bắt gặp.' },
};

export function tileIdentityCopy(tileType: string, nodeId: number, amount: number): TileIdentityCopy {
  const nodeCopy = NODE_COPY[nodeId];
  if (nodeCopy) {
    const amountSuffix = tileType === 'money' && amount !== 0
      ? ` ${amount > 0 ? '+' : ''}${amount} B$`
      : '';
    return {
      ...nodeCopy,
      title: `${nodeCopy.title}${amountSuffix}`,
      holdMs: tileType === 'normal' ? 1100 : 1550,
    };
  }

  if (tileType === 'money') {
    return {
      title: `${amount >= 0 ? '+' : ''}${amount} B$`,
      impact: amount >= 0 ? '💰' : '💸',
      description: amount >= 0 ? 'Ví dày thêm một chút.' : 'Ví vừa nhẹ đi một chút.',
      holdMs: 1550,
    };
  }
  if (tileType === 'card') return { title: 'Ô LÁ BÀI', impact: '🃏', description: 'Chuẩn bị rút một Lá Bài.', holdMs: 1550 };
  if (tileType === 'news') return { title: 'Ô TIN TỨC', impact: '📰', description: 'Thành phố sắp có biến.', holdMs: 1550 };
  if (tileType === 'ready') return { title: 'READY', impact: '🏁', description: 'Về lại điểm xuất phát.', holdMs: 1550 };
  return { title: 'GÓC PHỐ', impact: '👟', description: 'Đáp xuống an toàn. Không có biến cố.', holdMs: 1100 };
}
