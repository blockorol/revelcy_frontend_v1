import { convertStringToDecimalInput, normalizeStringDecimalInput } from "@utils/convertors";

export function convertNumberWithValidate (
    text: string, 
    minValue: number,
    maxValue: number,
    setRawValue:React.Dispatch<React.SetStateAction<string | undefined>>,
    setNumerValue:React.Dispatch<React.SetStateAction<number | undefined>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
) {
    const numericValue = normalizeStringDecimalInput(text)

    if (numericValue === '') {
        setRawValue(undefined)
        setNumerValue(undefined);
        setError(null);
        return undefined;
    }

    const numberValue = parseFloat(numericValue);
    setRawValue(numericValue)

    if (numberValue < minValue || numberValue > maxValue) {
        setError(`Value must be between ${minValue} and ${maxValue}`);
        setNumerValue(numberValue < minValue ? minValue : maxValue)
        return numberValue < minValue ? minValue : maxValue
    } else {
        setNumerValue(numberValue)
        setError(null);
        return numberValue
    }
}


export function convertNumberWithRaw (
    text: string, 
    setRawValue: (v: string | undefined) => void,
    setNumerValue: (v: number | undefined) => void,
    postfix?: string
) {
    const {value, raw} = convertStringToDecimalInput(text, postfix)

    if (raw === undefined) {
        setRawValue(undefined)
        setNumerValue(undefined);
        return undefined;
    }

    setRawValue(raw);
    setNumerValue(value);
    return value
}