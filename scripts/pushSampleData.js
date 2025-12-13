const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Helper để tạo Timestamp
function createTimestamp(secondsOffset = 0) {
  const now = admin.firestore.Timestamp.now();
  return admin.firestore.Timestamp.fromMillis(
    now.toMillis() + secondsOffset * 1000
  );
}

// Helper để tạo date string cho timestamp
function createDateString(secondsOffset = 0) {
  const date = new Date();
  date.setSeconds(date.getSeconds() + secondsOffset);
  return date;
}

// Messages mẫu tiếng Việt - đa dạng hơn
const sampleMessages = [
  // Chào hỏi
  "Chào bạn!",
  "Xin chào, bạn khỏe không?",
  "Chào buổi sáng!",
  "Hi, bạn có thời gian không?",

  // Hỏi thông tin
  "Bạn có thể giúp mình một việc được không?",
  "Mình muốn hỏi về dự án này",
  "Bạn có biết thông tin về deadline không?",
  "Mình cần tài liệu này gấp, bạn có thể gửi cho mình không?",
  "Bạn có thể giải thích rõ hơn được không?",

  // Phản hồi tích cực
  "Cảm ơn bạn nhiều!",
  "OK, mình sẽ làm ngay",
  "Được rồi, mình hiểu rồi",
  "Cảm ơn bạn đã hỗ trợ!",
  "Mình đã nhận được thông tin rồi",

  // Thông báo/Update
  "Mình sẽ kiểm tra lại và báo bạn sau nhé",
  "Mình sẽ cập nhật thông tin sau",
  "Để mình hỏi lại quản lý nhé",
  "Mình đang xử lý, sẽ báo bạn sớm",

  // Yêu cầu
  "Bạn có thời gian không? Mình muốn hỏi một chút",
  "Bạn có thể gửi lại cho mình được không?",
  "Mình cần file này trước 5h chiều",
  "Bạn có thể review giúp mình không?",

  // Công việc
  "Task này đã hoàn thành rồi",
  "Mình đang làm dở, sẽ xong trong 30 phút nữa",
  "Có vấn đề gì cần hỗ trợ không?",
  "Mình sẽ gửi báo cáo vào cuối tuần",

  // Cảm ơn/Nhắc nhở
  "Cảm ơn bạn đã nhắc nhở!",
  "Mình sẽ nhớ, cảm ơn bạn",
  "Đúng rồi, mình quên mất",
  "Mình sẽ check lại ngay"
];

// Messages mẫu cho phòng ban (formal hơn)
const sampleDepartmentMessages = [
  "Chào cả nhóm!",
  "Mọi người có thể cập nhật tiến độ dự án được không?",
  "Nhắc nhở: Deadline là cuối tuần này",
  "Cảm ơn mọi người đã làm việc chăm chỉ",
  "Có ai cần hỗ trợ gì không?",
  "Meeting tuần này sẽ vào thứ 3 lúc 2h chiều",
  "Mình đã cập nhật tài liệu mới, mọi người check nhé",
  "Cần feedback về proposal này trước ngày mai",
  "Chúc mọi người cuối tuần vui vẻ!",
  "Có thông báo quan trọng, mọi người đọc kỹ nhé",
  "Cảm ơn team đã hoàn thành tốt công việc",
  "Mình sẽ gửi agenda meeting sau",
  "Nhớ submit báo cáo trước deadline nhé",
  "Có update mới về chính sách công ty",
  "Mọi người có câu hỏi gì cứ hỏi nhé"
];

// Announcements mẫu
const sampleAnnouncements = [
  {
    title: "Thông báo họp phòng ban tuần này",
    content: "Mọi người nhớ tham gia meeting vào thứ 3 lúc 2h chiều. Có vấn đề gì vui lòng báo trước.",
    priority: "normal"
  },
  {
    title: "Nhắc nhở deadline dự án",
    content: "Dự án ABC cần hoàn thành trước ngày 20/12. Mọi người cố gắng hoàn thành đúng tiến độ.",
    priority: "urgent"
  },
  {
    title: "Thông báo nghỉ lễ",
    content: "Công ty sẽ nghỉ lễ từ ngày 25/12 đến 1/1. Mọi người sắp xếp công việc phù hợp.",
    priority: "normal"
  },
  {
    title: "Cập nhật chính sách làm việc",
    content: "Có một số thay đổi về chính sách làm việc từ xa. Mọi người vui lòng đọc kỹ email đã gửi.",
    priority: "normal"
  },
  {
    title: "Chúc mừng thành tích team",
    content: "Chúc mừng team đã đạt được mục tiêu quý này. Cảm ơn mọi người đã nỗ lực!",
    priority: "normal"
  }
];

// Tạo conversation mẫu
async function createSampleConversation(user1, user2, messageCount = 5) {
  // Tạo conversation ID (sort alphabetically)
  const members = [user1.uid, user2.uid].sort();
  const conversationId = `${members[0]}_${members[1]}`;

  const conversationRef = db.collection('conversations').doc(conversationId);
  const conversationDoc = await conversationRef.get();

  // Nếu conversation đã tồn tại, chỉ thêm messages
  if (conversationDoc.exists) {
    console.log(`  ⚠️  Conversation ${conversationId} đã tồn tại, chỉ thêm messages...`);
  } else {
    // Tạo conversation mới
    const conversation = {
      id: conversationId,
      type: "direct",
      members: members,
      memberDetails: {
        [user1.uid]: {
          avatar: user1.avatar || "",
          department: user1.department || "",
          name: user1.name
        },
        [user2.uid]: {
          avatar: user2.avatar || "",
          department: user2.department || "",
          name: user2.name
        }
      },
      lastMessage: null,
      unreadCount: {
        [user1.uid]: 0,
        [user2.uid]: 0
      },
      typing: {
        [user1.uid]: null,
        [user2.uid]: null
      },
      createdAt: createTimestamp(-3600), // 1 giờ trước
      updatedAt: createTimestamp(-3600)
    };

    await conversationRef.set(conversation);
    console.log(`  ✅ Đã tạo conversation: ${user1.name} <-> ${user2.name}`);
  }

  // Tạo messages mẫu
  const messagesRef = conversationRef.collection('messages');
  const existingMessages = await messagesRef.get();

  if (existingMessages.size > 0) {
    console.log(`  ⚠️  Đã có ${existingMessages.size} messages, bỏ qua...`);
    return;
  }

  let lastMessage = null;
  let lastSenderId = null;

  for (let i = 0; i < messageCount; i++) {
    // Luân phiên giữa 2 user
    const sender = i % 2 === 0 ? user1 : user2;
    const messageText = sampleMessages[i % sampleMessages.length];

    // Timestamp cách nhau 2-5 phút
    const timeOffset = -(messageCount - i) * (120 + Math.random() * 180);
    const messageTimestamp = createTimestamp(timeOffset);

    const message = {
      senderId: sender.uid,
      senderName: sender.name,
      senderAvatar: sender.avatar || "",
      text: messageText,
      imageBase64: null,
      fileBase64: null,
      fileName: null,
      fileSize: null,
      mimeType: null,
      type: "text",
      status: "sent",
      createdAt: messageTimestamp
    };

    await messagesRef.add(message);

    lastMessage = {
      text: messageText,
      senderId: sender.uid,
      senderName: sender.name,
      timestamp: messageTimestamp
    };
    lastSenderId = sender.uid;
  }

  // Cập nhật lastMessage và unreadCount
  const otherUserId = lastSenderId === user1.uid ? user2.uid : user1.uid;
  await conversationRef.update({
    lastMessage: lastMessage,
    [`unreadCount.${otherUserId}`]: admin.firestore.FieldValue.increment(1),
    updatedAt: createTimestamp()
  });

  console.log(`  ✅ Đã tạo ${messageCount} messages`);
}

// Tạo department messages mẫu
async function createSampleDepartmentMessages(department, users, messageCount = 8) {
  const deptRef = db.collection('departments').doc(department.id);
  const deptDoc = await deptRef.get();

  if (!deptDoc.exists) {
    console.log(`  ⚠️  Department ${department.id} không tồn tại, bỏ qua...`);
    return;
  }

  // Lấy users thuộc department này
  const deptUsers = users.filter(u => u.department === department.id);
  if (deptUsers.length === 0) {
    console.log(`  ⚠️  Không có users trong department ${department.id}, bỏ qua...`);
    return;
  }

  // Kiểm tra xem đã có messages chưa
  const messagesRef = deptRef.collection('messages');
  const existingMessages = await messagesRef.get();

  if (existingMessages.size > 0) {
    console.log(`  ⚠️  Department ${department.id} đã có ${existingMessages.size} messages, bỏ qua...`);
    return;
  }

  let lastMessage = null;

  for (let i = 0; i < messageCount; i++) {
    // Chọn random user trong department
    const sender = deptUsers[Math.floor(Math.random() * deptUsers.length)];
    const messageText = sampleDepartmentMessages[i % sampleDepartmentMessages.length];

    // Timestamp cách nhau 5-15 phút
    const timeOffset = -(messageCount - i) * (300 + Math.random() * 600);
    const messageTimestamp = createTimestamp(timeOffset);

    const message = {
      senderId: sender.uid,
      senderName: sender.name,
      senderAvatar: sender.avatar || "",
      senderDepartment: sender.department || "",
      text: messageText,
      imageBase64: null,
      fileBase64: null,
      fileName: null,
      fileSize: null,
      mimeType: null,
      type: "text",
      createdAt: messageTimestamp
    };

    await messagesRef.add(message);

    lastMessage = {
      text: messageText,
      senderId: sender.uid,
      senderName: sender.name,
      timestamp: messageTimestamp
    };
  }

  // Cập nhật lastMessage và unreadCount cho tất cả members (trừ người gửi cuối)
  const updateData = {
    lastMessage: lastMessage,
    updatedAt: createTimestamp()
  };

  // Increment unreadCount cho tất cả members trừ người gửi cuối cùng
  // Chỉ increment 1 lần cho message cuối cùng
  deptUsers.forEach(user => {
    if (user.uid !== lastMessage.senderId) {
      updateData[`unreadCount.${user.uid}`] = admin.firestore.FieldValue.increment(1);
    }
  });

  await deptRef.update(updateData);
  console.log(`  ✅ Đã tạo ${messageCount} messages cho department ${department.id}`);
}

// Tạo announcements mẫu
async function createSampleAnnouncements(users, departments) {
  // Lấy managers và directors để tạo announcements
  const creators = users.filter(u => u.role === 'manager' || u.role === 'director');

  if (creators.length === 0) {
    console.log('  ⚠️  Không có manager/director để tạo announcements, bỏ qua...');
    return;
  }

  // Kiểm tra xem đã có announcements chưa
  const announcementsRef = db.collection('announcements');
  const existingAnnouncements = await announcementsRef.get();

  if (existingAnnouncements.size > 0) {
    console.log(`  ⚠️  Đã có ${existingAnnouncements.size} announcements, bỏ qua...`);
    return;
  }

  let createdCount = 0;

  // Tạo 2-3 announcements phòng ban
  for (let i = 0; i < Math.min(3, departments.length); i++) {
    const dept = departments[i];
    const creator = creators[Math.floor(Math.random() * creators.length)];
    const announcement = sampleAnnouncements[i % sampleAnnouncements.length];

    const timeOffset = -(i + 1) * 3600; // Cách nhau 1 giờ

    const announcementData = {
      title: announcement.title,
      content: announcement.content,
      createdBy: creator.uid,
      createdByName: creator.name,
      createdAt: createTimestamp(timeOffset),
      priority: announcement.priority,
      scope: "department",
      targetDepartments: [dept.id],
      readBy: []
    };

    await announcementsRef.add(announcementData);
    createdCount++;
  }

  // Tạo 1-2 announcements công ty (chỉ director)
  const directors = users.filter(u => u.role === 'director');
  if (directors.length > 0) {
    const director = directors[0];
    const companyAnnouncement = sampleAnnouncements[3];

    const companyData = {
      title: companyAnnouncement.title,
      content: companyAnnouncement.content,
      createdBy: director.uid,
      createdByName: director.name,
      createdAt: createTimestamp(-7200),
      priority: companyAnnouncement.priority,
      scope: "company",
      targetDepartments: [],
      readBy: []
    };

    await announcementsRef.add(companyData);
    createdCount++;
  }

  console.log(`  ✅ Đã tạo ${createdCount} announcements`);
}

// Main function
async function pushSampleData() {
  console.log('🚀 Bắt đầu push dữ liệu mẫu...\n');

  try {
    // 1. Lấy tất cả users
    console.log('📋 Đang lấy danh sách users...');
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));

    if (users.length < 2) {
      console.log('❌ Cần ít nhất 2 users để tạo conversations!');
      return;
    }

    console.log(`✅ Tìm thấy ${users.length} users\n`);

    // 2. Lấy tất cả departments
    console.log('📁 Đang lấy danh sách departments...');
    const departmentsSnapshot = await db.collection('departments').get();
    const departments = departmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(`✅ Tìm thấy ${departments.length} departments\n`);

    // 3. Tạo conversations mẫu (1-1)
    // Mỗi user sẽ có conversation với 2-3 users khác
    console.log('💬 Đang tạo conversations và messages mẫu (1-1)...\n');

    const createdConversations = new Set();
    let totalConversations = 0;
    let totalMessages = 0;

    for (let i = 0; i < users.length; i++) {
      const user1 = users[i];

      // Mỗi user chat với 2-3 users khác
      const targetCount = Math.min(3, users.length - 1);
      const targets = [];

      for (let j = 0; j < users.length; j++) {
        if (i !== j && targets.length < targetCount) {
          targets.push(users[j]);
        }
      }

      for (const user2 of targets) {
        const members = [user1.uid, user2.uid].sort();
        const conversationId = `${members[0]}_${members[1]}`;

        if (!createdConversations.has(conversationId)) {
          createdConversations.add(conversationId);

          const messageCount = 5 + Math.floor(Math.random() * 5); // 5-10 messages
          await createSampleConversation(user1, user2, messageCount);
          totalConversations++;
          totalMessages += messageCount;

          // Delay nhỏ để tránh rate limit
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }

    console.log(`\n✅ Đã tạo ${totalConversations} conversations với ${totalMessages} messages\n`);

    // 4. Tạo department messages mẫu
    console.log('🏢 Đang tạo tin nhắn phòng ban...\n');
    let totalDeptMessages = 0;

    for (const department of departments) {
      const messageCount = 8 + Math.floor(Math.random() * 7); // 8-15 messages
      await createSampleDepartmentMessages(department, users, messageCount);
      totalDeptMessages += messageCount;

      // Delay nhỏ để tránh rate limit
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n✅ Đã tạo ${totalDeptMessages} tin nhắn phòng ban\n`);

    // 5. Tạo announcements mẫu
    console.log('📢 Đang tạo thông báo...\n');
    await createSampleAnnouncements(users, departments);

    console.log('\n✅ Hoàn thành!');
    console.log(`📊 Thống kê:`);
    console.log(`  - Conversations (1-1): ${totalConversations}`);
    console.log(`  - Messages (1-1): ${totalMessages}`);
    console.log(`  - Department Messages: ${totalDeptMessages}`);
    console.log(`  - Announcements: Đã tạo`);
    console.log('\n✨ Bạn có thể mở app để kiểm tra dữ liệu mẫu!');

  } catch (error) {
    console.error('\n❌ Lỗi:', error);
    process.exit(1);
  }
}

// Chạy script
pushSampleData()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });

