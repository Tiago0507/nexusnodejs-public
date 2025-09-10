export const sessionMock = {
  withTransaction: async (fn: () => Promise<void>) => { await fn(); },
  endSession: () => {},
} as any;

export const mongooseMock = {
  startSession: async () => sessionMock,
  Types: {
    ObjectId: function (v?: string) { return { toString: () => String(v ?? 'id') } as any; }
  }
} as any;
