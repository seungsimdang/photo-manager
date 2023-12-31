import {
  doc,
  writeBatch,
} from 'https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'https://www.gstatic.com/firebasejs/10.2.0/firebase-storage.js';
import { db } from './firebase.js';
import { storage } from './firebase.js';

export const phoneType = (num) => {
  return `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7, 11)}`;
};

// Storage에서 사진 삭제
export const deleteData = (photoUrl) => {
  const desertRef = ref(storage, photoUrl);
  deleteObject(desertRef);
};

const imgRemoveBtn = document.querySelector('.img-remove-btn');
const imgTextInput = document.getElementById('imgTextInput');
const profileImg = document.getElementById('profileImg');

// input 파일이 바뀌면 firebase Storage에 저장하고 화면에 표시
export const changeProfile = (userID) => {
  const imageInputEl = document.getElementById('profilePic');

  imageInputEl.addEventListener('change', async () => {
    const file = imageInputEl.files[0];

    if (file) {
      const storageRef = ref(storage, 'profile/' + Math.random() + file.name);

      try {
        const [uploadResult, url] = await Promise.all([
          // storage에 사진 저장
          uploadBytes(storageRef, file),
          // storage에 저장된 사진 url 가져오기
          getDownloadURL(storageRef),
        ]);

        // 프로필 이미지 url input에 저장
        imgTextInput.value = url;
        // 프로필 이미지 변경
        document.getElementById('profileImg').src = url;
        // 프로필 이미지 삭제 버튼 표시
        imgRemoveBtn.classList.remove('hidden');

        // 정보 수정일 경우에는 firestore에서 바로 수정
        if (userID) {
          const batch = writeBatch(db);
          const idRef = doc(db, 'users', userID);
          batch.update(idRef, { profile: url });
          await batch.commit();
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  });
};

// 프로필 이미지 삭제
export const removeProfile = () => {
  imgRemoveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    deleteData(imgTextInput.value);
    if (imgTextInput.value) {
      imgTextInput.value = '';
      profileImg.src = '';
      imgRemoveBtn.classList.add('hidden');
    }
  });
};

// input 태그에서 엔터 눌러도 submit 막기
export const preventEnter = () => {
  const textInput = document.querySelectorAll('.regist-text-input');
  for (const i of textInput) {
    i.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
      }
    });
  }
};
