import type { FaceExpression } from './session';
import { getStarterCharacterV01 } from '../content/core/characters_starter_v01';
import {
  SECRET_BABY_CHARACTER_ID,
  SECRET_BABY_V01,
} from '../content/core/character_secret_baby_v01';

export type CharacterReactionContextCh04 =
  | 'attack'
  | 'targeted'
  | 'gain'
  | 'loss'
  | 'spectate'
  | 'job'
  | 'minigame'
  | 'salary'
  | 'shuffle'
  | 'chaos';

export interface CharacterReactionVariablesCh04 {
  amount?: number;
  actor?: string;
  target?: string;
  speaker?: string;
}

export interface CharacterReactionLineCh04 {
  reactionProfileId: string;
  expression: FaceExpression;
  text: string;
}

type ReactionTemplateCh04 = {
  expression: FaceExpression;
  text: string;
};

type CharacterReactionProfileCh04 = Record<
  CharacterReactionContextCh04,
  readonly ReactionTemplateCh04[]
>;

const PROFILES_CH04: Record<string, CharacterReactionProfileCh04> = {
  'reaction.starter.crybaby.v01': {
    attack: [
      { expression: 'angry', text: 'Tui xin lỗi nha… nhưng {target} đưa tiền đây!' },
      { expression: 'happy', text: 'Đừng giận tui, lá bài bắt tui làm đó!' },
    ],
    targeted: [
      { expression: 'angry', text: 'Trời ơi! Sao cứ nhắm đúng tui vậy?' },
      { expression: 'angry', text: 'Ví tui có làm gì ai đâu mà khổ dữ vậy!' },
    ],
    gain: [
      { expression: 'happy', text: 'Ai dỗ tui vậy? Dỗ tiếp đi!' },
      { expression: 'happy', text: 'Được {amount}B$ là tui hết buồn liền!' },
    ],
    loss: [
      { expression: 'angry', text: 'Trời ơi, {amount}B$ của tui!' },
      { expression: 'angry', text: 'Đời tui lại sang tập bi kịch mới rồi!' },
    ],
    spectate: [
      { expression: 'neutral', text: 'Thấy chưa, cái bàn này drama hơn phim nữa!' },
      { expression: 'neutral', text: 'Tui chưa bị gì mà tui đã muốn khóc giùm rồi.' },
    ],
    job: [
      { expression: 'happy', text: 'Có việc làm rồi hả? Cho tui cái nghề đỡ đau tim nha!' },
      { expression: 'neutral', text: 'Đi làm thôi mà sao tui hồi hộp dữ vậy trời.' },
    ],
    minigame: [
      { expression: 'angry', text: 'Khoan, thiệt sự phải thi hả? Tui run rồi đó!' },
      { expression: 'happy', text: 'Nếu thắng nhớ dỗ tui trước nha!' },
    ],
    salary: [
      { expression: 'happy', text: 'Lương về! Tự nhiên đời đẹp hẳn luôn!' },
      { expression: 'happy', text: '{amount}B$ này chữa lành được chút xíu.' },
    ],
    shuffle: [
      { expression: 'angry', text: 'Trời ơi! Bàn cờ cũng thay lòng đổi dạ nữa!' },
      { expression: 'neutral', text: 'Mới nhớ đường xong mà nó đổi hết rồi!' },
    ],
    chaos: [
      { expression: 'neutral', text: 'Khoan… cho tui hiểu chuyện gì vừa xảy ra đã!' },
      { expression: 'angry', text: 'Ủa rồi ai chịu trách nhiệm cho cảm xúc của tui?' },
    ],
  },
  'reaction.starter.grumpy.v01': {
    attack: [
      { expression: 'happy', text: '{target}, đừng nhìn tui. Luật chơi thôi.' },
      { expression: 'angry', text: 'Tới lượt tui thì tui làm. Có ý kiến gì không?' },
    ],
    targeted: [
      { expression: 'angry', text: 'Đụng vô tui nữa coi.' },
      { expression: 'angry', text: 'Nhớ mặt đó. Lát tính sổ.' },
    ],
    gain: [
      { expression: 'happy', text: 'Ừ. Cuối cùng cũng có chuyện hợp lý.' },
      { expression: 'neutral', text: '{amount}B$. Tạm chấp nhận.' },
    ],
    loss: [
      { expression: 'angry', text: 'Ai duyệt cái khoản mất {amount}B$ này vậy?' },
      { expression: 'angry', text: 'Không vui. Rất không vui.' },
    ],
    spectate: [
      { expression: 'neutral', text: 'Tự xử đi. Đừng kéo tui vô.' },
      { expression: 'neutral', text: 'Biết ngay kiểu gì cũng có chuyện.' },
    ],
    job: [
      { expression: 'neutral', text: 'Có nghề thì làm. Đừng họp hành dài dòng.' },
      { expression: 'angry', text: 'Lương ổn thì ký. Không ổn thì thôi.' },
    ],
    minigame: [
      { expression: 'angry', text: 'Thi thì thi. Đừng có nhường tui.' },
      { expression: 'neutral', text: 'Luật đâu? Nói một lần cho rõ.' },
    ],
    salary: [
      { expression: 'happy', text: '{amount}B$. Ừ, công sức phải có giá chứ.' },
      { expression: 'neutral', text: 'Lương về đúng hạn. Tạm được.' },
    ],
    shuffle: [
      { expression: 'angry', text: 'Ai cho đổi bàn lúc tui vừa nhớ đường vậy?' },
      { expression: 'neutral', text: 'Rồi. Lại phải học bản đồ từ đầu.' },
    ],
    chaos: [
      { expression: 'angry', text: 'Cái bàn này không ai chịu ngồi yên hết hả?' },
      { expression: 'neutral', text: 'Rồi. Ai giải thích ngắn gọn giùm.' },
    ],
  },
  'reaction.starter.anxious.v01': {
    attack: [
      { expression: 'neutral', text: 'Khoan, tui tính rồi… chắc làm vậy là ít rủi ro nhất.' },
      { expression: 'angry', text: '{target} đừng giận, tui đã cân nhắc hết rồi!' },
    ],
    targeted: [
      { expression: 'angry', text: 'Biết ngay mà! Tui đã lo chuyện này từ nãy!' },
      { expression: 'angry', text: 'Khoan khoan, cho tui kiểm tra lại luật!' },
    ],
    gain: [
      { expression: 'happy', text: 'Ổn rồi. Có thêm {amount}B$ dự phòng.' },
      { expression: 'happy', text: 'Tốt… ít nhất tình hình chưa sập.' },
    ],
    loss: [
      { expression: 'angry', text: 'Mất {amount}B$… ngân sách khẩn cấp đâu rồi?' },
      { expression: 'angry', text: 'Tui đã có linh cảm xấu mà!' },
    ],
    spectate: [
      { expression: 'neutral', text: 'Mọi người bình tĩnh, để tui tính xác suất đã.' },
      { expression: 'neutral', text: 'Tui ghi chú vụ này lại. Có gì còn phòng.' },
    ],
    job: [
      { expression: 'neutral', text: 'Khoan, để tui so lương với rủi ro trước.' },
      { expression: 'happy', text: 'Có nghề là tốt… chắc vậy.' },
    ],
    minigame: [
      { expression: 'angry', text: 'Mini Game bất ngờ hả? Tui chưa chuẩn bị tinh thần!' },
      { expression: 'neutral', text: 'Để tui đọc luật lại một lần nữa.' },
    ],
    salary: [
      { expression: 'happy', text: '{amount}B$ vào quỹ dự phòng. Tốt.' },
      { expression: 'happy', text: 'Lương về rồi. Thở được chút.' },
    ],
    shuffle: [
      { expression: 'angry', text: 'Bản đồ đổi rồi! Kế hoạch A coi như xong!' },
      { expression: 'neutral', text: 'Được, chuyển sang kế hoạch B… nếu có.' },
    ],
    chaos: [
      { expression: 'angry', text: 'Không có trong kế hoạch. Không có trong kế hoạch!' },
      { expression: 'neutral', text: 'Cho tui năm giây sắp xếp lại mọi thứ.' },
    ],
  },
  'reaction.starter.hyper.v01': {
    attack: [
      { expression: 'happy', text: 'Tới luôn {target}! Đang vui mà!' },
      { expression: 'happy', text: 'Bấm rồi nha! Không hoàn tác nha!' },
    ],
    targeted: [
      { expression: 'angry', text: 'Ê! Chơi tui hả? Tới nữa coi!' },
      { expression: 'happy', text: 'Được! Có đối thủ mới vui!' },
    ],
    gain: [
      { expression: 'happy', text: '+{amount}B$! Tiếp tiếp tiếp!' },
      { expression: 'happy', text: 'Ngon! Vòng sau chơi lớn hơn nữa!' },
    ],
    loss: [
      { expression: 'angry', text: 'Bay {amount}B$ hả? Kệ, quẩy tiếp!' },
      { expression: 'happy', text: 'Thua khúc này thôi, còn nguyên trận mà!' },
    ],
    spectate: [
      { expression: 'happy', text: 'Ê hay đó! Làm lại phát nữa đi!' },
      { expression: 'happy', text: 'Căng lên, căng lên! Đừng đứng hình!' },
    ],
    job: [
      { expression: 'happy', text: 'Có Job mới! Chọn nhanh rồi chạy tiếp!' },
      { expression: 'happy', text: 'Đi làm cũng được, miễn đừng bắt ngồi yên!' },
    ],
    minigame: [
      { expression: 'happy', text: 'MINI GAME! Tới luôn!' },
      { expression: 'happy', text: 'Cuối cùng cũng tới phần tui thích!' },
    ],
    salary: [
      { expression: 'happy', text: '+{amount}B$! Nhận lương xong chạy tiếp!' },
      { expression: 'happy', text: 'Tiền về rồi! Năng lượng cũng về!' },
    ],
    shuffle: [
      { expression: 'happy', text: 'Đổi bàn hả? Hay! Chơi lại từ đầu!' },
      { expression: 'happy', text: 'Càng loạn càng vui! Tới đi!' },
    ],
    chaos: [
      { expression: 'happy', text: 'Không hiểu gì hết nhưng vui!' },
      { expression: 'happy', text: 'Bàn cờ càng loạn càng đã!' },
    ],
  },
  'reaction.secret.baby.v01': {
    attack: [
      { expression: 'happy', text: '{target}, nộp đây. Bé đang bận thắng.' },
      { expression: 'neutral', text: 'Luật đơn giản: bé muốn, bé lấy.' },
    ],
    targeted: [
      { expression: 'angry', text: 'Ai cho phép chọc bé?' },
      { expression: 'neutral', text: 'Ghi tên rồi. Bé nhớ dai lắm.' },
    ],
    gain: [
      { expression: 'happy', text: '{amount}B$? Được. Để vào quỹ sữa.' },
      { expression: 'happy', text: 'Vũ trụ biết điều đó.' },
    ],
    loss: [
      { expression: 'angry', text: 'Mất {amount}B$? Vũ trụ xử lý đi.' },
      { expression: 'angry', text: 'Bé không khóc. Bé gọi quản lý.' },
    ],
    spectate: [
      { expression: 'neutral', text: 'Các người lớn ồn quá.' },
      { expression: 'happy', text: 'Tiếp tục đi. Bé đang giải trí.' },
    ],
    job: [
      { expression: 'neutral', text: 'Job nào lương cao nhất? Bé bận.' },
      { expression: 'happy', text: 'Cho bé chức quản lý.' },
    ],
    minigame: [
      { expression: 'happy', text: 'Thi đi. Bé cho các người cơ hội.' },
      { expression: 'neutral', text: 'Mini Game hả? Xếp hàng.' },
    ],
    salary: [
      { expression: 'happy', text: '{amount}B$? Chuyển vào quỹ sữa.' },
      { expression: 'neutral', text: 'Lương tới rồi. Vũ trụ làm việc tốt.' },
    ],
    shuffle: [
      { expression: 'happy', text: 'Bé vừa muốn đổi bàn. Chuẩn.' },
      { expression: 'neutral', text: 'Bản đồ mới. Bé vẫn thắng.' },
    ],
    chaos: [
      { expression: 'neutral', text: 'Bình tĩnh. Để bé xử.' },
      { expression: 'happy', text: 'Ừ, đúng ý bé rồi đó.' },
    ],
  },
};

function replaceVariablesCh04(
  template: string,
  variables: CharacterReactionVariablesCh04,
): string {
  const amount = Math.abs(Math.floor(Number(variables.amount ?? 0)));
  return template
    .replaceAll('{amount}', String(amount))
    .replaceAll('{actor}', variables.actor ?? 'người ta')
    .replaceAll('{target}', variables.target ?? 'người ta')
    .replaceAll('{speaker}', variables.speaker ?? 'tui');
}

export function reactionProfileIdForCharacterCh04(
  characterId: string | undefined,
): string | undefined {
  if (!characterId) return undefined;
  if (characterId === SECRET_BABY_CHARACTER_ID) return SECRET_BABY_V01.reactionProfileId;
  return getStarterCharacterV01(characterId)?.reactionProfileId;
}

export function characterReactionLineCh04(
  characterId: string | undefined,
  context: CharacterReactionContextCh04,
  variables: CharacterReactionVariablesCh04,
  variantKey: number,
): CharacterReactionLineCh04 | undefined {
  const reactionProfileId = reactionProfileIdForCharacterCh04(characterId);
  if (!reactionProfileId) return undefined;
  const profile = PROFILES_CH04[reactionProfileId];
  if (!profile) return undefined;
  const pool = profile[context];
  if (!pool || pool.length === 0) return undefined;
  const index = Math.abs(Math.floor(variantKey)) % pool.length;
  const selected = pool[index] ?? pool[0];
  if (!selected) return undefined;
  return {
    reactionProfileId,
    expression: selected.expression,
    text: replaceVariablesCh04(selected.text, variables),
  };
}
