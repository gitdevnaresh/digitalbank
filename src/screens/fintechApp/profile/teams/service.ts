import { get, post, put } from "../../../../utils/ApiService";
import { cardsGet } from "../../../../utils/ApiService";

const TeamsService = {
    // Teams List
    getTeamsList: async (status = "All", search: string | null = null, page = 1, pageSize = 20) => {
        const data = await get(`api/v1/teams/members?status=${status}&search=${search}&page=${page}&pageSize=${pageSize}`);
        return data;
    },
    toggleMemberStatus: async (memberId: string, action: string) => {
        const data = await put(`api/v1/teams/members/${memberId}/${action}`,{});
        return data;
    },
    getTeamsKpis: async () => {
        const data = await get('api/v1/teams/kpi');
        return data;
    },
    getTeamsLu: async () => {
        const data = await get('api/v1/teams/lookup');
        return data;
    },
    // Invite Member
    inviteMember: async (memberData: any) => {
        const data = await post('api/v1/teams/invite', memberData);
        return data;
    },
    getKycLookup: async () => {
        const data = await get('api/v1/kyc/lookup');
        return data;
    },
    
    // Member Details
    getMemberDetails: async (memberId: string) => {
        const data = await get(`api/v1/teams/members/${memberId}`);
        return data;
    },
    
    // Cards Management
    getMemberCards: async (memberId: string, search = "", page = 1, pageSize = 10) => {
        const searchValue = search && search.trim() !== '' ? search : null;
        const data = await get(`api/v1/teams/members/${memberId}/cards?search=${searchValue}&page=${page}&pageSize=${pageSize}`);
        return data;
    },
    getMemberCardsKpi: async (memberId: string) => {
        const data = await get(`api/v1/members/id/cards/kpi?id=${memberId}`);
        return data;
    },
    
    // Card Details
    getCardDetails: async (cardId: string) => {
        const data = await cardsGet(`api/v1/cards/${cardId}`);
        return data;
    },
    
    // Card Transactions
    getCardTransactions: async (cardId: string, page = 1, pageSize = 10) => {
        const data = await get(`api/v1/teams/member/cards/${cardId}/transactions?page=${page}&pageSize=${pageSize}`);
        return data;
    },
    
    // Card History
    getCardHistory: async (page = 1, pageSize = 10,cardId:string) => {
        const data = await get(`api/v1/teams/member/cards/history/all/${cardId}?page=${page}&pageSize=${pageSize}`);
        return data;
    },
    
    // Member Transactions
    getMemberTransactions: async (memberId: string, type = "All", search: string | null = null, fromDate = "", toDate = "", status = "All", page = 1, pageSize = 10) => {
        const searchValue = search || null;
        const fromDateParam = fromDate ? `&fromdate=${fromDate}` : '';
        const toDateParam = toDate ? `&todate=${toDate}` : '';
        const statusParam = status && status !== 'All' ? `&status=${status}` : '';
        const data = await get(`api/v1/teams/members/${memberId}/transactions?type=${type}&search=${searchValue}&page=${page}&pageSize=${pageSize}${fromDateParam}${toDateParam}${statusParam}`);
        return data;
    },
    
    getselectedEmployeesTransactions: async (memberId: string, page = 1, pageSize = 10) => {
        const data = await get(`api/v1/teams/members/${memberId}/transactions?page=${page}&pageSize=${pageSize}`);
        return data;
    },
    
    // Transaction Details
    getTransactionDetails: async (transactionId: string) => {
        const data = await get(`api/v1/transactions/${transactionId}`);
        return data;
    },
    getselectedEmployeesTransactionDetails: async (transactionId: string) => {
        const data = await get(`api/v1/teams/member/${transactionId}/transactions`);
        return data;
    },
    // Download Transaction
    downloadTransaction: async (transactionId: string) => {
        const data = await get(`api/v1/transaction/download?id=${transactionId}`);
        return data;
    },
};

export default TeamsService;