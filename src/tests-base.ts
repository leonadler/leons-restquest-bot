/// <reference path="../typings/main.d.ts" />

import { install as sourcemapSupport } from 'source-map-support';
import 'mocha';

sourcemapSupport({ handleUncaughtExceptions: false });

export { expect } from 'chai';
