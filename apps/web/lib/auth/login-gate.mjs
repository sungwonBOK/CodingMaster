const actionLabels = {
  run: "실행",
  submit: "제출",
  hint: "힌트",
};

export function getLoginRequiredNotice(action) {
  return {
    title: "로그인이 필요합니다",
    message: `${actionLabels[action]} 기능은 로그인 후 사용할 수 있습니다.`,
  };
}
