import { BaseQueue } from "@root/queues/base.queue";
import { authWorker } from "@auth/services/auth.worker";
import { IAuthJob } from "@auth/interfaces/user.interface";


class AuthQueue extends BaseQueue {
  constructor() {
    super('auth');
    this.processJob('addAuthUserToDB', 5, authWorker.addAuthUserToDB);
  }

  public addAuthUserJob(name: string, data: IAuthJob): void {
    this.addJob(name, data);
  }
}

export const authQueue: AuthQueue = new AuthQueue();
