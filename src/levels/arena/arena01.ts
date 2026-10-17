import { MusicTrack } from "../../types";
import { toTime } from "../../utils";
import { v2Level } from "../v2Level";

// url: <http://localhost:3000/snek-js/editor/?data=CldpckpvUG9%25252BdG0qbWdhKk8nUypuam4qUydPKmEneihmVilfPVYpS2hRUXRWKV9meihmTyphJ24qU2pTKm4nYSpPZ20qbWtockpvUG8oSmhpV3wyNzV8UklHSFR8QVJFTkEgMDFlZXwzeDNVVTN5I0U3NkY1MU1FMjREMjhzMjQ3NDlsbHM0NDk0Q3MzNDc0QXM5NEQ1MHM2NEE0RE0yQTlEOEZNMkZCMUEyTUY0QTI2MU1FOUM0NkFNRTlEM0E3VWRkZFUyVVlZWVlVLnAna2h0KHFxPXc9Ki0tLiEgSlhYWEstPUxYCk0tI09WPXBQfnJYWlhfX19fX1hackxySlFCQmtfKkstY2NLXypLS0JCClMhPS4geTFtIVd1WGJidUx4MF8qKmEgKVZkLTEtMS0xZXx2dnZ2Zj16J2cnKXoqVncnaCBMaVhfbWJibV9MaichKS4qISkuJ2s9S2xNMjY0NjUzbVYhbi4pIW8oKChwICBxPT1yWC1zTTR0WClLdUpKSkpYdjk5dykgeFl8eVV8eiEufihKLUwBfnp5eHd2dXRzcnFwb25tbGtqaWhnZmVkYV9ZV1ZVU1FQT01MS0ouKikoJyFf&id=e8bc2854-9731-4b3b-b54e-3f37f3a871fc>

export const LEVEL_ARENA_01 = v2Level({
  id: 'arena-01',
  name: 'Arena 01',
  parTime: toTime({ minutes: 2, seconds: 0 }),
  layoutV2: 'CldpckpvUG9%252BdG0qbWdhKk8nUypuam4qUydPKmEneihmVilfPVYpS2hRUXRWKV9meihmTyphJ24qU2pTKm4nYSpPZ20qbWtockpvUG8oSmhpV3wyNzV8UklHSFR8QVJFTkEgMDFlZXwzeDNVVTN5I0U3NkY1MU1FMjREMjhzMjQ3NDlsbHM0NDk0Q3MzNDc0QXM5NEQ1MHM2NEE0RE0yQTlEOEZNMkZCMUEyTUY0QTI2MU1FOUM0NkFNRTlEM0E3VWRkZFUyVVlZWVlVLnAna2h0KHFxPXc9Ki0tLiEgSlhYWEstPUxYCk0tI09WPXBQfnJYWlhfX19fX1hackxySlFCQmtfKkstY2NLXypLS0JCClMhPS4geTFtIVd1WGJidUx4MF8qKmEgKVZkLTEtMS0xZXx2dnZ2Zj16J2cnKXoqVncnaCBMaVhfbWJibV9MaichKS4qISkuJ2s9S2xNMjY0NjUzbVYhbi4pIW8oKChwICBxPT1yWC1zTTR0WClLdUpKSkpYdjk5dykgeFl8eVV8eiEufihKLUwBfnp5eHd2dXRzcnFwb25tbGtqaWhnZmVkYV9ZV1ZVU1FQT01MS0ouKikoJyFf',
  annotations: { 14: 4, 15: 4, 44: 4, 45: 4, 420: 0, 421: 0, 422: 0, 423: 0, 424: 0, 425: 0, 426: 0, 427: 0, 428: 0, 429: 0, 430: 0, 431: 0, 432: 0, 433: 0, 434: 0, 435: 0, 436: 0, 437: 0, 438: 0, 439: 0, 440: 0, 441: 0, 442: 0, 443: 0, 444: 0, 445: 0, 446: 0, 447: 0, 448: 0, 449: 0, 450: 0, 451: 0, 452: 0, 453: 0, 454: 0, 455: 0, 456: 0, 457: 0, 458: 0, 459: 0, 460: 0, 461: 0, 462: 0, 463: 0, 464: 0, 465: 0, 466: 0, 467: 0, 468: 0, 469: 0, 470: 0, 471: 0, 472: 0, 473: 0, 474: 0, 475: 0, 476: 0, 477: 0, 478: 0, 479: 0, 854: 4, 855: 4, 884: 4, 885: 4 },
  musicTrack: MusicTrack.simpleTime,
});
