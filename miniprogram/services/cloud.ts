type CloudPayload = Record<string, unknown>;

export interface CloudCallOptions<TData extends CloudPayload> {
  name: string;
  data?: TData;
}

export async function callCloudFunction<TInput extends CloudPayload, TOutput>(
  options: CloudCallOptions<TInput>
): Promise<TOutput> {
  const result = await (wx.cloud.callFunction({
    name: options.name,
    data: options.data
  }) as unknown as Promise<{ result: TOutput }>);

  return result.result;
}
