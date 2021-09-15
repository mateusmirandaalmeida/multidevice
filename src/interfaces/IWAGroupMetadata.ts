export interface IWAGroupParticipant {
    jid: string;
    isAdmin: boolean;
    isSuperAdmin: boolean;
}

export interface IWAGroupMetadata {
    name: string;
    id: string;
    creation: string;
    creator: string;
    restrict: boolean;
    announce: boolean;
    description: string;
    descriptionId: string;
    participants: IWAGroupParticipant[],
}