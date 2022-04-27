const convertToPersonBlock = (setting) => {
  let name;
  let email = null;
  if (setting.id.includes('|')) {
    const index = setting.id.indexOf('|');
    email = setting.id.slice(0, index);
    name = setting.id.slice(index+1);
  } else {
    // v1.0.3以前
    name = setting.id;
  }

  return {
    x: setting.x,
    y: setting.y,
    name,
    email,
    status: '状態不明',
  };
};

module.exports = {
  from: (layout) => {
    return layout.map(convertToPersonBlock)
      .filter(b => b.name); // v1.0.3 以前は Label オブジェクトが誤って保存されていたため、ここで name 空を除いておく
  },

  merge: (blocks, people) => {
    const updatedBlocks = blocks
      .map(block => {
        const person = people.find(p => p.name === block.name);
        if (person) {
          block.email = person.email;
          block.status = person.status;
        }
        return block;
      });
    const newBlocks = people
      .filter(p => !updatedBlocks.some(b => b.name === p.name))
      .map((p, i) => {
        return {
          x: 10,
          y: 10 + 20 * i,
          name: p.name,
          email: p.email,
          status: p.status,
        }
      })

    return updatedBlocks.concat(newBlocks);
  }
};