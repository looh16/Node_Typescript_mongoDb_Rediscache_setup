import Logger from 'bunyan';
import { indexOf, findIndex } from 'lodash';
import { config } from '@root/config';
import { RedisCommandRawReply } from '@redis/client/dist/lib/commands';
import { IUserDocument } from '@auth/interfaces/user.interface';
import { BaseCache } from '@redis/base.cache';
import { ServerError } from '@shared/helpers/error-handler';
import { Helpers } from '@shared/helpers/helpers';

const log: Logger = config.createLogger('userCache');
type UserCacheMultiType = string | number | Buffer | RedisCommandRawReply[] | IUserDocument | IUserDocument[];

export class UserCache extends BaseCache {
  constructor() {
    super('userCache');
  }

  public async saveUserToCache(key: string, userUId: string, createdUser: IUserDocument): Promise<void> {
    const createdAt = new Date(Helpers.parseJson(`${new Date()}`));
    const year = Helpers.parseJson(`${new Date().getFullYear()}`);
    const {
      _id,
      uId,
      fullName,
      email,
      role,
      province,
      city,
      locality

    } = createdUser;
    const dataToSave = {
      '_id': `${_id}`,
      'uId': `${uId}`,
      'fullName': `${fullName}`,
      'role': `${role}`,
      'province': `${province}`,
      'createdAt': `${createdAt}`,
      'email': `${email}`,
      'city': `${city}`,
      'locality': `${locality}`,
      'year': `${year}`
    };

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.ZADD('user', { score: parseInt(userUId, 10), value: `${key}` });
      for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
        await this.client.HSET(`users:${key}`, `${itemKey}`, `${itemValue}`);
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getUserFromCache(userId: string): Promise<IUserDocument | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const response: IUserDocument = (await this.client.HGETALL(`users:${userId}`)) as unknown as IUserDocument;
      response.createdAt = new Date(Helpers.parseJson(`${response.createdAt}`));
      response.email = Helpers.parseJson(`${response.email}`);
      response.fullName = Helpers.parseJson(`${response.fullName}`);
      response.province = Helpers.parseJson(`${response.province}`);
      response.city = Helpers.parseJson(`${response.city}`);
      response.locality = Helpers.parseJson(`${response.locality}`);
      response.year = Helpers.parseJson(`${response.year}`);
      response.id = Helpers.parseJson(`${response.id}`);
      response.uId = Helpers.parseJson(`${response.uId}`);
      response._id = Helpers.parseJson(`${response._id}`);
      response.role = Helpers.parseJson(`${response.role}`);


      return response;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getUsersFromCache(start: number, end: number, excludedUserKey: string): Promise<IUserDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response: string[] = await this.client.ZRANGE('user', start, end, { REV: true });
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const key of response) {
        if (key !== excludedUserKey) {
          multi.HGETALL(`users:${key}`);
        }
      }
      const replies: UserCacheMultiType = (await multi.exec()) as UserCacheMultiType;
      const userReplies: IUserDocument[] = [];
      for (const reply of replies as IUserDocument[]) {
        reply.createdAt = new Date(Helpers.parseJson(`${reply.createdAt}`));
        reply.fullName = Helpers.parseJson(`${reply.fullName}`);
        reply.province = Helpers.parseJson(`${reply.province}`);
        reply.city = Helpers.parseJson(`${reply.city}`);
        reply.locality = Helpers.parseJson(`${reply.locality}`);
        reply.year = Helpers.parseJson(`${reply.year}`);
        reply.role = Helpers.parseJson(`${reply.role}`);

        userReplies.push(reply);
      }
      return userReplies;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

/*  public async getRandomUsersFromCache(userId: string, excludedUsername: string): Promise<IUserDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const replies: IUserDocument[] = [];
      const followers: string[] = await this.client.LRANGE(`followers:${userId}`, 0, -1);
      const users: string[] = await this.client.ZRANGE('user', 0, -1);
      const randomUsers: string[] = Helpers.shuffle(users).slice(0, 10);
      for (const key of randomUsers) {
        const followerIndex = indexOf(followers, key);
        if (followerIndex < 0) {
          const userHash: IUserDocument = (await this.client.HGETALL(`users:${key}`)) as unknown as IUserDocument;
          replies.push(userHash);
        }
      }
      const excludedUsernameIndex: number = findIndex(replies, ['username', excludedUsername]);
      replies.splice(excludedUsernameIndex, 1);
      for (const reply of replies) {
        reply.createdAt = new Date(Helpers.parseJson(`${reply.createdAt}`));
        reply.postsCount = Helpers.parseJson(`${reply.postsCount}`);
        reply.blocked = Helpers.parseJson(`${reply.blocked}`);
        reply.blockedBy = Helpers.parseJson(`${reply.blockedBy}`);
        reply.notifications = Helpers.parseJson(`${reply.notifications}`);
        reply.social = Helpers.parseJson(`${reply.social}`);
        reply.followersCount = Helpers.parseJson(`${reply.followersCount}`);
        reply.followingCount = Helpers.parseJson(`${reply.followingCount}`);
        reply.bgImageId = Helpers.parseJson(`${reply.bgImageId}`);
        reply.bgImageVersion = Helpers.parseJson(`${reply.bgImageVersion}`);
        reply.profilePicture = Helpers.parseJson(`${reply.profilePicture}`);
        reply.work = Helpers.parseJson(`${reply.work}`);
        reply.school = Helpers.parseJson(`${reply.school}`);
        reply.location = Helpers.parseJson(`${reply.location}`);
        reply.quote = Helpers.parseJson(`${reply.quote}`);
      }
      return replies;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }**/

  /*public async updateSingleUserItemInCache(userId: string, prop: string, value: UserItem): Promise<IUserDocument | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.HSET(`users:${userId}`, `${prop}`, JSON.stringify(value));
      const response: IUserDocument = (await this.getUserFromCache(userId)) as IUserDocument;
      return response;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }**/

  public async getTotalUsersInCache(): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const count: number = await this.client.ZCARD('user');
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}

export const userCache: UserCache = new UserCache();
