export async function GetExcelContactsFile(pathWithFileName: string) {
    return `${process.env.BACKEND_URL}/public/${pathWithFileName}`
}